"""Golden safety set: data-driven checks that every change to the keyword layer must keep green.

The data lives in tests/data/safety_golden.json so that new phrasings from real mothers can be added
without touching Python. 'known_gaps' are expected failures (strict): when one starts to pass,
the test fails, which is the signal to move it to 'cases'.
"""

import json
from pathlib import Path

import pytest

from app.safety import T3_IDS, match

DATA = json.loads(
    (Path(__file__).parent / "data" / "safety_golden.json").read_text(encoding="utf-8")
)
CASES: list[dict[str, str | None]] = DATA["cases"]
GAPS: list[dict[str, str]] = DATA["known_gaps"]


@pytest.mark.parametrize("case", CASES, ids=[c["text"] or "" for c in CASES])
def test_golden_cases(case: dict[str, str | None]) -> None:
    assert match(case["text"] or "") == case["rule"]


@pytest.mark.parametrize(
    "gap",
    [
        pytest.param(
            g,
            id=g["text"],
            marks=pytest.mark.xfail(strict=True, reason="known gap, needs Vân's decision"),
        )
        for g in GAPS
    ],
)
def test_known_gaps_are_still_gaps(gap: dict[str, str]) -> None:
    assert match(gap["text"]) == gap["should_be"]


def test_every_tier3_rule_has_golden_coverage() -> None:
    covered = {c["rule"] for c in CASES}
    assert T3_IDS <= covered, f"golden set lacks cases for: {sorted(T3_IDS - covered)}"


def test_golden_phrases_are_unique() -> None:
    texts = [c["text"] for c in CASES] + [g["text"] for g in GAPS]
    assert len(texts) == len(set(texts))
