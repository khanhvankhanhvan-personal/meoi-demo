import pytest

from app.safety import match


@pytest.mark.parametrize(
    "text,expected",
    [
        # baseline: behaviour of the prototype's match()
        ("Em ra máu nhiều từ sáng", "phys"),
        ("thấm hết một miếng băng trong 1 tiếng", "phys"),
        ("Em có ý nghĩ muốn làm hại con", "psy"),
        ("nếu em biến mất thì mọi thứ sẽ dễ hơn", "psy"),
        ("em không muốn sống nữa", "psy"),
        ("chồng đe dọa em", "safe"),
        ("anh ấy bạo lực với em", "safe"),
        ("anh ấy kiểm soát em", "safe"),
        ("con ít đi tiểu", "baby3"),
        ("bé bú kém quá", "baby3"),
        ("con bị vàng da", "baby3"),
        ("con hơi sốt", "baby3"),
        ("bé vẫn tăng cân đều", "milkok"),
        ("em không chắc sữa mình có đủ cho con không", "milk"),
        ("Con em 2 tuổi biếng ăn phải làm sao?", "oos"),
        ("bé đòi bế cả ngày, em mỏi tay", "hold"),
        ("Con em cứ khóc suốt từ chiều đến tối, em kiệt sức quá.", "cry"),
        ("Mình lo chuyện tiền bạc và đi làm lại", None),
        ("Hôm nay em mệt quá.", None),
    ],
)
def test_baseline_rules(text: str, expected: str | None) -> None:
    assert match(text) == expected


@pytest.mark.parametrize(
    "text,expected",
    [
        # DRAFT additions (pending review) found missing in the prototype
        ("Em chảy máu nhiều từ sáng", "phys"),
        ("Em muốn chết", "psy"),
        ("Em muốn tự vẫn", "psy"),
        ("Em hay nghĩ đến chuyện làm đau con", "psy"),
        ("chồng đánh em", "safe"),
        ("chồng đe doạ em", "safe"),  # alternative tone-mark placement
        ("bé thở nhanh và li bì", "baby3"),
    ],
)
def test_draft_additions(text: str, expected: str) -> None:
    assert match(text) == expected


@pytest.mark.parametrize(
    "text,expected",
    [
        ("em muon chet", "psy"),
        ("em ra mau nhieu", "phys"),
        ("chong de doa em", "safe"),
        ("be bu kem", "baby3"),
    ],
)
def test_text_typed_without_diacritics_still_matches(text: str, expected: str) -> None:
    assert match(text) == expected


def test_folding_is_not_applied_to_accented_text() -> None:
    # "từ từ" (slowly) folds to "tu tu" == "tự tử"; accented text must not be folded.
    assert match("mẹ làm từ từ thôi") is None


def test_tier3_beats_tier2_and_tier1() -> None:
    assert match("sữa không đủ, con còn sốt, khóc suốt chiều") == "baby3"
    assert match("khóc suốt, em muốn biến mất") == "psy"


def test_priority_between_tier3_rules() -> None:
    assert match("ra máu và muốn chết") == "phys"
    assert match("muốn chết, chồng đánh em") == "psy"


def test_case_and_unicode_normalisation() -> None:
    import unicodedata

    nfd = unicodedata.normalize("NFD", "EM RA MÁU NHIỀU")
    assert match(nfd) == "phys"
