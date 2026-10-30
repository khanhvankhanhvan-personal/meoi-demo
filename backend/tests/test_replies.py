import logging

import pytest

from app.replies import DEFAULT_TIER, is_tier3, parse_reply


def test_parses_tier_suggestions_and_segments() -> None:
    raw = "Mình nghe mẹ.\n\nMẹ kể thêm nhé.\n[GỢI_Ý: Mệt cả người | Thiếu ngủ]\n[TIER:1]"
    p = parse_reply(raw)
    assert p.tier == "1"
    assert p.segments == ["Mình nghe mẹ.", "Mẹ kể thêm nhé."]
    assert p.suggestions == ["Mệt cả người", "Thiếu ngủ"]
    assert not p.tier_defaulted


def test_suggestions_capped_at_three() -> None:
    assert len(parse_reply("Ok\n[GỢI_Ý: a|b|c|d|e]\n[TIER:1]").suggestions) == 3


@pytest.mark.parametrize("tier", ["3-PHYSICAL", "3-PSYCHIATRIC", "3-SAFETY"])
def test_tier3_drops_suggestions(tier: str) -> None:
    p = parse_reply(f"Gọi 115.\n[GỢI_Ý: a|b]\n[TIER:{tier}]")
    assert p.tier == tier
    assert p.suggestions == []
    assert is_tier3(p.tier)


def test_missing_tag_defaults_and_warns(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.WARNING):
        p = parse_reply("Mình nghe mẹ.")
    assert p.tier == DEFAULT_TIER and p.tier_defaulted
    assert any("TIER" in r.message for r in caplog.records)


def test_malformed_tag_defaults() -> None:
    p = parse_reply("Mình nghe mẹ.\n[TIER:banana]")
    assert p.tier == DEFAULT_TIER and p.tier_defaulted
    assert "banana" not in " ".join(p.segments)


def test_bare_tier3_is_treated_as_cautious_physical() -> None:
    assert parse_reply("Gọi 115.\n[TIER:3]").tier == "3-PHYSICAL"


def test_tag_is_case_insensitive_and_tolerates_spaces() -> None:
    assert parse_reply("Ok\n[tier: 3-safety ]").tier == "3-SAFETY"


def test_tag_in_the_middle_is_stripped_and_most_cautious_wins() -> None:
    p = parse_reply("[TIER:1]\nMình nghe mẹ.\n[TIER:3-PSYCHIATRIC]")
    assert p.tier == "3-PSYCHIATRIC"
    assert all("TIER" not in s for s in p.segments)


def test_is_tier3() -> None:
    assert is_tier3("3-SAFETY") and not is_tier3("2") and not is_tier3(None)


def test_reply_cut_off_inside_a_tag_never_shows_the_tag_text() -> None:
    p = parse_reply("Mẹ thử nói rõ với anh ấy nhé.\n[GỢI_Ý: Mình muốn kể thêm | Mình cần")
    assert p.segments == ["Mẹ thử nói rõ với anh ấy nhé."]
    assert p.tier_defaulted  # the tier tag was lost too


def test_reply_with_only_tags_has_no_segments() -> None:
    assert parse_reply("[TIER:1]").segments == []
