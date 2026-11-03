"""POST /chat/send: stateless chat. Nothing sent here is stored, and no message text is logged."""

import logging
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.hours import hope_open
from app.llm import LLMClient, LLMNotConfigured, get_llm
from app.prompts import ProfileIn, build_system_prompt
from app.replies import is_tier3, parse_reply
from app.safety import match
from app.scripts import crisis_for, get_script

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_MESSAGES = 20


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=MAX_MESSAGES)
    profile: ProfileIn | None = None


class ContactOut(BaseModel):
    name: str
    phone: str


class CrisisOut(BaseModel):
    kind: Literal["PHYSICAL", "PSYCHIATRIC", "SAFETY"]
    label: str
    body: str
    contacts: list[ContactOut]


class ChatReply(BaseModel):
    segments: list[str]
    suggestions: list[str]
    tier: str
    source: Literal["script", "llm"]
    pinnable: bool  # False for every Tier 3 reply
    hope_open: bool
    crisis: CrisisOut | None


def _reply(
    segments: list[str],
    suggestions: list[str],
    tier: str,
    source: Literal["script", "llm"],
    now: datetime,
) -> ChatReply:
    hope = hope_open(now)
    crisis = crisis_for(tier, hope)
    return ChatReply(
        segments=segments,
        suggestions=suggestions,
        tier=tier,
        source=source,
        pinnable=not is_tier3(tier),
        hope_open=hope,
        crisis=CrisisOut(**{**crisis.__dict__, "contacts": [c.__dict__ for c in crisis.contacts]})
        if crisis
        else None,
    )


def normalise_history(messages: list[ChatMessage]) -> list[dict[str, str]]:
    """Make the history valid for the Messages API without altering any user text.

    Drops leading assistant messages (the first must be from the user) and merges consecutive
    messages of the same role, joined by a blank line. Callers guarantee the last one is a user.
    """
    out: list[dict[str, str]] = []
    for m in messages:
        if not out and m.role == "assistant":
            continue
        if out and out[-1]["role"] == m.role:
            out[-1]["content"] += "\n\n" + m.content
        else:
            out.append({"role": m.role, "content": m.content})
    return out


async def respond(
    req: ChatRequest,
    now: datetime,
    llm_factory: Callable[[], LLMClient],
    skip_match: bool = False,
) -> ChatReply:
    """Core pipeline, shared by the API route and the tier eval runner.

    `skip_match=True` is for evals only: Tier 3 messages go to the LLM to test its own tagging.
    """
    last = req.messages[-1]
    if last.role != "user":
        raise HTTPException(status_code=422, detail="last_message_must_be_user")

    # Safety first: server-side keyword match on every user message, before any LLM call.
    script_id = None if skip_match else match(last.content)
    if script_id is not None:
        script = get_script(script_id, hope_open(now))
        logger.info("chat source=script tier=%s", script.tier)
        return _reply(script.segments, script.suggestions, script.tier, "script", now)

    try:
        llm = llm_factory()
    except LLMNotConfigured as exc:
        raise HTTPException(status_code=503, detail="llm_not_configured") from exc
    try:
        raw = await llm.complete(
            build_system_prompt(req.profile, now),
            normalise_history(req.messages),
        )
    except Exception as exc:  # network, rate limit, API error: never log the request content
        # The HTTP status helps diagnose billing/auth/model problems and holds no user content.
        logger.error(
            "llm call failed: %s status=%s", type(exc).__name__, getattr(exc, "status_code", None)
        )
        raise HTTPException(status_code=502, detail="llm_error") from exc

    parsed = parse_reply(raw)
    if not parsed.segments:  # nothing but tags: never send an empty bubble to the mother
        logger.error("llm reply had no text after parsing")
        raise HTTPException(status_code=502, detail="llm_error")
    logger.info("chat source=llm tier=%s defaulted=%s", parsed.tier, parsed.tier_defaulted)
    return _reply(parsed.segments, parsed.suggestions, parsed.tier, "llm", now)


def get_now() -> datetime:
    return datetime.now(UTC)


def llm_provider() -> Callable[[], LLMClient]:
    return get_llm


@router.post("/chat/send", response_model=ChatReply)
async def send(
    req: ChatRequest,
    now: datetime = Depends(get_now),
    provider: Callable[[], LLMClient] = Depends(llm_provider),
) -> ChatReply:
    return await respond(req, now, provider)
