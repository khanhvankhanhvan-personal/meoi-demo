"""LLM access. The model name comes from the environment; it is never hard-coded."""

import logging
import os
from typing import Protocol

from anthropic import AsyncAnthropic

logger = logging.getLogger(__name__)

# Thinking tokens count against max_tokens. With 1000 the model's reasoning could use the whole
# budget and cut the reply (or leave no text at all), so leave generous room and think briefly.
MAX_TOKENS = 4000
DEFAULT_EFFORT = "low"


class LLMNotConfigured(RuntimeError):
    """ANTHROPIC_API_KEY or ANTHROPIC_MODEL is missing."""


class LLMEmptyReply(RuntimeError):
    """The model returned no text (refusal, or it ran out of tokens while thinking)."""


class LLMClient(Protocol):
    async def complete(self, system: str, messages: list[dict[str, str]]) -> str: ...


class AnthropicLLM:
    def __init__(self, api_key: str, model: str, effort: str = DEFAULT_EFFORT) -> None:
        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model
        self._effort = effort

    async def complete(self, system: str, messages: list[dict[str, str]]) -> str:
        resp = await self._client.messages.create(  # type: ignore[call-overload]
            model=self._model,
            max_tokens=MAX_TOKENS,
            system=system,
            messages=messages,
            output_config={"effort": self._effort},
        )
        text = "".join(block.text for block in resp.content if block.type == "text")
        if resp.stop_reason in ("max_tokens", "refusal") or not text.strip():
            category = getattr(getattr(resp, "stop_details", None), "category", None)
            logger.warning(
                "llm reply unusable: stop_reason=%s category=%s", resp.stop_reason, category
            )
            if not text.strip():
                raise LLMEmptyReply(resp.stop_reason or "empty")
        return text


def get_llm() -> LLMClient:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    model = os.environ.get("ANTHROPIC_MODEL", "").strip()
    if not api_key or not model:
        raise LLMNotConfigured("ANTHROPIC_API_KEY and ANTHROPIC_MODEL must be set")
    return AnthropicLLM(api_key, model, os.environ.get("ANTHROPIC_EFFORT", DEFAULT_EFFORT).strip())
