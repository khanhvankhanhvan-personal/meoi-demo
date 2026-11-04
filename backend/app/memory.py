"""Bộ nhớ của mẹ: short facts a mother chose to keep, always worded as attribution to her.

Suggest + confirm: `POST /memories/suggest` only proposes (nothing is stored); an item exists only
after an explicit `POST /memories`. Crisis (Tier 3) content is never suggested and never stored.
Logs carry event names and the pseudonymous user id only, never memory or message text.
"""

import json
import logging
import re
import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.auth import CurrentUser
from app.chat import ChatMessage, llm_provider
from app.db import get_db
from app.llm import LLMClient
from app.memory_core import CATEGORIES, Category, get_settings
from app.models import Memory, MemorySetting
from app.safety import T3_IDS, match
from app.security import WindowLimiter

logger = logging.getLogger(__name__)
router = APIRouter(tags=["memory"])
DB = Annotated[Session, Depends(get_db)]

MAX_ITEMS = 100
MIN_LEN, MAX_LEN = 3, 200
MAX_SUGGESTIONS = 2
PREFIX = "Mẹ kể rằng"
_PROMPT_FILE = Path(__file__).parent / "prompts" / "memory_extract_vi.md"

# Suggest calls cost money: at most 30 per hour per user (beyond that: no suggestions).
suggest_limiter = WindowLimiter(limit=30, window=3600)

CRISIS_NOT_REMEMBERED = (
    "Mình không lưu điều này vào bộ nhớ. Nếu mẹ cần được giúp ngay, mẹ gọi 115 hoặc "
    "người thân gần nhất nhé."
)
MEMORY_OFF = "Bộ nhớ đang tắt hoặc chủ đề này đang tắt. Mẹ bật lại trong phần cài đặt nhé."


def _check_text(value: str) -> str:
    value = " ".join(value.split())
    if not MIN_LEN <= len(value) <= MAX_LEN:
        raise ValueError(f"Nội dung dài {MIN_LEN}-{MAX_LEN} ký tự.")
    return value


class MemoryOut(BaseModel):
    id: str
    text: str
    category: Category
    created_at: datetime


class MemoryList(BaseModel):
    items: list[MemoryOut]


class MemoryCreate(BaseModel):
    text: str
    category: Category

    _text = field_validator("text")(_check_text)


class MemoryEdit(BaseModel):
    text: str

    _text = field_validator("text")(_check_text)


class SettingsIO(BaseModel):
    enabled: bool
    topics: list[Category]

    @field_validator("topics")
    @classmethod
    def _dedupe(cls, value: list[str]) -> list[str]:
        return [c for c in CATEGORIES if c in value]


class SuggestIn(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=12)


class Suggestion(BaseModel):
    text: str
    category: Category


class SuggestOut(BaseModel):
    suggestions: list[Suggestion]


def _out(row: Memory) -> MemoryOut:
    return MemoryOut(
        id=str(row.id),
        text=row.text,
        category=row.category,  # type: ignore[arg-type]
        created_at=row.created_at,
    )


def _is_crisis(text: str) -> bool:
    return match(text) in T3_IDS


def _owned(db: Session, user_id: uuid.UUID, memory_id: uuid.UUID) -> Memory:
    row = db.get(Memory, memory_id)
    if row is None or row.user_id != user_id:
        raise HTTPException(404, "Mình không tìm thấy mục này.")
    return row


def _find_duplicate(
    db: Session, user_id: uuid.UUID, text: str, skip: uuid.UUID | None = None
) -> Memory | None:
    key = text.casefold()
    for row in db.scalars(select(Memory).where(Memory.user_id == user_id)):
        if row.id != skip and row.text.casefold() == key:
            return row
    return None


# --- settings (declared before /memories/{id} so "settings" is never read as an id) ---


@router.get("/memories/settings", response_model=SettingsIO)
def read_settings(user: CurrentUser, db: DB) -> SettingsIO:
    enabled, topics = get_settings(db, user.id)
    return SettingsIO(enabled=enabled, topics=topics)  # type: ignore[arg-type]


@router.put("/memories/settings", response_model=SettingsIO)
def write_settings(body: SettingsIO, user: CurrentUser, db: DB) -> SettingsIO:
    row = db.get(MemorySetting, user.id)
    if row is None:
        db.add(MemorySetting(user_id=user.id, enabled=body.enabled, topics=list(body.topics)))
    else:
        row.enabled = body.enabled
        row.topics = list(body.topics)
    db.commit()
    logger.info("memory settings user=%s enabled=%s", user.id, body.enabled)
    return body


# --- suggest (stateless: stores nothing) ---


@lru_cache(maxsize=1)
def _extract_prompt() -> str:
    return _PROMPT_FILE.read_text(encoding="utf-8")


def _transcript(messages: list[ChatMessage]) -> str:
    lines = [f"{'Mẹ' if m.role == 'user' else 'Trợ lý'}: {m.content}" for m in messages]
    return "Đoạn trò chuyện:\n\n" + "\n\n".join(lines)


def _parse_items(raw: str) -> list[dict[str, Any]]:
    """Pull `{"items": [...]}` out of the reply, tolerating code fences and extra text."""
    cleaned = re.sub(r"```(?:json)?", "", raw)
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start < 0 or end <= start:
        return []
    try:
        data = json.loads(cleaned[start : end + 1])
    except ValueError:
        return []
    items = data.get("items") if isinstance(data, dict) else None
    if not isinstance(items, list):
        return []
    return [i for i in items if isinstance(i, dict)]


def _shape(text: str) -> str | None:
    """One line, 'Mẹ kể rằng' prefix, within the length limits; None when unusable."""
    text = " ".join(text.split())
    if not text:
        return None
    if not text.lower().startswith(PREFIX.lower()):
        text = f"{PREFIX} {text}"
    return text if MIN_LEN <= len(text) <= MAX_LEN else None


def filter_suggestions(
    raw_items: list[dict[str, Any]], topics: list[str], existing: set[str]
) -> list[Suggestion]:
    seen = set(existing)
    out: list[Suggestion] = []
    for item in raw_items:
        text, category = item.get("text"), item.get("category")
        if not isinstance(text, str) or category not in topics:
            continue
        shaped = _shape(text)
        if shaped is None or _is_crisis(shaped) or shaped.casefold() in seen:
            continue
        seen.add(shaped.casefold())
        out.append(Suggestion(text=shaped, category=category))
        if len(out) == MAX_SUGGESTIONS:
            break
    return out


@router.post("/memories/suggest", response_model=SuggestOut)
async def suggest(
    body: SuggestIn,
    user: CurrentUser,
    db: DB,
    provider: Callable[[], LLMClient] = Depends(llm_provider),
) -> SuggestOut:
    none = SuggestOut(suggestions=[])
    enabled, topics = get_settings(db, user.id)
    if not enabled or not topics:
        return none
    # Safety first: crisis content is never sent to memory extraction (no LLM call at all).
    if any(m.role == "user" and _is_crisis(m.content) for m in body.messages):
        return none
    if not suggest_limiter.allow(str(user.id)):
        return none
    try:
        llm = provider()
        raw = await llm.complete(
            _extract_prompt(), [{"role": "user", "content": _transcript(body.messages)}]
        )
        items = _parse_items(raw)
    except Exception as exc:  # not configured, network, API error: suggestions are optional
        logger.warning("memory suggest failed: %s", type(exc).__name__)
        return none
    existing = {
        t.casefold() for t in db.scalars(select(Memory.text).where(Memory.user_id == user.id))
    }
    result = filter_suggestions(items, topics, existing)
    logger.info("memory suggest user=%s count=%d", user.id, len(result))
    return SuggestOut(suggestions=result)


# --- CRUD ---


@router.get("/memories", response_model=MemoryList)
def list_memories(user: CurrentUser, db: DB) -> MemoryList:
    rows = db.scalars(
        select(Memory).where(Memory.user_id == user.id).order_by(Memory.created_at.desc())
    )
    return MemoryList(items=[_out(r) for r in rows])


@router.post("/memories", response_model=MemoryOut, status_code=201)
def create_memory(body: MemoryCreate, user: CurrentUser, db: DB, response: Response) -> MemoryOut:
    enabled, topics = get_settings(db, user.id)
    if not enabled or body.category not in topics:
        raise HTTPException(400, MEMORY_OFF)
    if _is_crisis(body.text):
        raise HTTPException(400, CRISIS_NOT_REMEMBERED)
    dup = _find_duplicate(db, user.id, body.text)
    if dup is not None:
        response.status_code = 200
        return _out(dup)
    count = db.scalar(select(func.count()).select_from(Memory).where(Memory.user_id == user.id))
    if (count or 0) >= MAX_ITEMS:
        raise HTTPException(409, "Bộ nhớ đã đầy, mẹ xoá bớt vài mục rồi thêm tiếp nhé.")
    now = datetime.now(UTC)
    row = Memory(user_id=user.id, text=body.text, category=body.category, created_at=now)
    row.updated_at = now
    db.add(row)
    db.commit()
    logger.info("memory created user=%s", user.id)
    return _out(row)


@router.patch("/memories/{memory_id}", response_model=MemoryOut)
def edit_memory(memory_id: uuid.UUID, body: MemoryEdit, user: CurrentUser, db: DB) -> MemoryOut:
    row = _owned(db, user.id, memory_id)
    if _is_crisis(body.text):
        raise HTTPException(400, CRISIS_NOT_REMEMBERED)
    if _find_duplicate(db, user.id, body.text, skip=row.id) is not None:
        raise HTTPException(409, "Mục này đã có trong bộ nhớ rồi.")
    row.text = body.text
    row.updated_at = datetime.now(UTC)
    db.commit()
    logger.info("memory edited user=%s", user.id)
    return _out(row)


@router.delete("/memories/{memory_id}", status_code=204)
def delete_memory(memory_id: uuid.UUID, user: CurrentUser, db: DB) -> None:
    row = _owned(db, user.id, memory_id)
    db.delete(row)
    db.commit()
    logger.info("memory deleted user=%s", user.id)


@router.delete("/memories", status_code=204)
def delete_all_memories(user: CurrentUser, db: DB) -> None:
    db.execute(delete(Memory).where(Memory.user_id == user.id))
    db.commit()
    logger.info("memories cleared user=%s", user.id)
