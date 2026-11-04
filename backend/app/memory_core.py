"""Shared pieces of the mother's memory: topics, settings, and loading items for the chat prompt.

Kept apart from `app/memory.py` (the HTTP routes) so `app/chat.py` can use it without a cycle.
Nothing here logs memory text.
"""

import logging
import uuid
from collections.abc import Callable, Iterator
from typing import Annotated, Literal, get_args

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Memory, MemorySetting, User
from app.security import read_access_token

logger = logging.getLogger(__name__)

Category = Literal["life", "family", "feelings", "body", "work_money"]
CATEGORIES: tuple[str, ...] = get_args(Category)
DEFAULT_TOPICS: list[str] = ["life", "family", "feelings", "work_money"]  # body is OFF by default

PROMPT_MAX_ITEMS = 12
PROMPT_MAX_CHARS = 3000
ACCESS_COOKIE = "meoi_at"  # same cookie as app.auth (not imported: auth would pull in the routes)


def get_settings(db: Session, user_id: uuid.UUID) -> tuple[bool, list[str]]:
    """(enabled, topics in canonical order). Defaults apply when she has no settings row."""
    row = db.get(MemorySetting, user_id)
    if row is None:
        return True, list(DEFAULT_TOPICS)
    topics = [c for c in CATEGORIES if c in (row.topics or [])]
    return bool(row.enabled), topics


def prompt_items(db: Session, user_id: uuid.UUID) -> list[str]:
    """Texts to inject into the chat prompt: enabled topics only, newest first, size-capped."""
    enabled, topics = get_settings(db, user_id)
    if not enabled or not topics:
        return []
    rows = db.scalars(
        select(Memory)
        .where(Memory.user_id == user_id, Memory.category.in_(topics))
        .order_by(Memory.updated_at.desc())
        .limit(PROMPT_MAX_ITEMS)
    ).all()
    out: list[str] = []
    total = 0
    for row in rows:
        if total + len(row.text) > PROMPT_MAX_CHARS:
            break
        out.append(row.text)
        total += len(row.text)
    return out


def optional_db(request: Request) -> Iterator[Session | None]:
    """Like `get_db`, but yields None when no database is configured (guests need none).

    Resolves `get_db` through the app's dependency overrides so tests can swap it.
    """
    provider = request.app.dependency_overrides.get(get_db, get_db)
    gen = provider()
    try:
        session = next(gen)
    except HTTPException:  # 503: no database on this server
        yield None
        return
    except Exception:
        logger.warning("optional db unavailable")
        yield None
        return
    try:
        yield session
    finally:
        gen.close()


def optional_user(
    request: Request, db: Annotated[Session | None, Depends(optional_db)]
) -> User | None:
    """The signed-in user, or None on ANY problem (guest, bad token, no database)."""
    if db is None:
        return None
    try:
        token = request.cookies.get(ACCESS_COOKIE)
        sub = read_access_token(token) if token else None
        return db.get(User, uuid.UUID(sub)) if sub else None
    except Exception:
        return None


MemoryLoader = Callable[[], list[str]]


def memory_loader(
    user: Annotated[User | None, Depends(optional_user)],
    db: Annotated[Session | None, Depends(optional_db)],
) -> MemoryLoader | None:
    """A lazy loader, so the Tier 3 script path never touches the database."""
    if user is None or db is None:
        return None
    user_id = user.id

    def load() -> list[str]:
        return prompt_items(db, user_id)

    return load
