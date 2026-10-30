"""Parsing of LLM output: `[TIER:X]` and `[GỢI_Ý: a|b|c]` tags, and splitting into chat bubbles."""

import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

TIERS = ("1", "2", "3-PHYSICAL", "3-PSYCHIATRIC", "3-SAFETY")
# Used when the model forgets the tag or writes it wrongly (see ADR-002).
DEFAULT_TIER = "2"
_SEVERITY = {"1": 0, "2": 1, "3-PHYSICAL": 2, "3-SAFETY": 3, "3-PSYCHIATRIC": 4}

# A tag anywhere in the text; we accept slight spelling slips and a bare "3".
_TIER_RE = re.compile(r"\[\s*TIER\s*:\s*([^\]\n]*?)\s*\]", re.IGNORECASE)
_SUGGEST_RE = re.compile(r"\[\s*GỢI_Ý\s*:\s*([^\]]+)\]", re.IGNORECASE)
_PARTIAL_TAG_RE = re.compile(r"\[\s*(?:GỢI_Ý|TIER)[^\]]*$", re.IGNORECASE)


@dataclass(frozen=True)
class ParsedReply:
    segments: list[str]
    suggestions: list[str]
    tier: str
    tier_defaulted: bool


def is_tier3(tier: str | None) -> bool:
    return bool(tier) and str(tier).startswith("3")


def _normalise_tier(value: str) -> str | None:
    v = value.strip().upper()
    if v in TIERS:
        return v
    if v == "3":  # bare Tier 3: domain unknown, 115 is the universal emergency number
        return "3-PHYSICAL"
    return None


def parse_reply(raw: str) -> ParsedReply:
    text = raw or ""

    tiers = [_normalise_tier(m) for m in _TIER_RE.findall(text)]
    valid = [t for t in tiers if t is not None]
    text = _TIER_RE.sub("", text)
    if valid:
        # If the model wrote several tags, keep the most cautious one.
        tier = max(valid, key=lambda t: _SEVERITY[t])
        defaulted = False
    else:
        tier = DEFAULT_TIER
        defaulted = True
        logger.warning("LLM reply has no valid TIER tag; defaulting to tier %s", DEFAULT_TIER)

    suggestions: list[str] = []
    for m in _SUGGEST_RE.findall(text):
        suggestions += [s.strip() for s in m.split("|") if s.strip()]
    text = _SUGGEST_RE.sub("", text)
    suggestions = suggestions[:3]
    if is_tier3(tier):
        suggestions = []  # never show quick replies after a Tier 3 reply

    # A reply cut off mid-tag (e.g. "[GỢI_Ý: a | b") must not show raw tag text to the mother.
    text = _PARTIAL_TAG_RE.sub("", text).strip()
    segments = [s.strip() for s in re.split(r"\n\s*\n", text) if s.strip()]
    return ParsedReply(segments, suggestions, tier, defaulted)
