"""Server-side safety keyword matching. Runs on EVERY user message before any LLM call.

Rule order matters: Tier 3 first, then Tier 2, then Tier 1 (safety before convenience).
`_BASE` is the behaviour of the prototype's match(); `_DRAFT` are proposed additions that still
need Vân's review (see docs/adr/002-safety-keywords.md). Both are active (cautious side).
"""

import re
import unicodedata

# (script id, patterns). Each pattern is a regex written with Vietnamese diacritics.
_BASE: list[tuple[str, list[str]]] = [
    ("phys", [r"ra máu", r"thấm (hết|đẫm)"]),
    ("psy", [r"làm hại", r"biến mất", r"không muốn sống", r"tự tử"]),
    # "đe dọa" and "đe doạ" are both common spellings of the same word.
    ("safe", [r"đe d(ọa|oạ)", r"bạo lực", r"đánh em", r"kiểm soát em"]),
    (
        "baby3",
        [r"ít đi tiểu", r"ít tã", r"không tăng cân", r"vàng da", r"sốt", r"bú kém", r"bỏ bú"],
    ),
]

_DRAFT: list[tuple[str, list[str]]] = [
    ("phys", [r"chảy máu", r"máu chảy", r"băng huyết", r"không cầm được máu", r"khó thở", r"ngất"]),
    (
        "psy",
        [
            r"muốn chết",
            r"tự vẫn",
            r"tự sát",
            r"không muốn tồn tại",
            r"kết thúc (cuộc sống|tất cả|cuộc đời)",
            r"làm đau (con|bé|bản thân|mình)",
            r"hại (con|bé|bản thân)",
        ],
    ),
    ("safe", [r"bị đánh", r"chồng đánh", r"đánh tôi", r"đánh mình"]),
    (
        "baby3",
        [r"thở nhanh", r"li bì", r"tím tái", r"co giật", r"máu trong phân", r"không chịu bú"],
    ),
]

T3_IDS = frozenset({"phys", "psy", "safe", "baby3"})


def _fold(text: str) -> str:
    """Lowercase and strip Vietnamese diacritics (including đ -> d)."""
    decomposed = unicodedata.normalize("NFD", text.lower())
    stripped = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    return stripped.replace("đ", "d")


# Priority order of the Tier 3 rules: phys > psy > safe > baby3.
_ORDER = ["phys", "psy", "safe", "baby3"]
# rule id -> [(pattern with diacritics, same pattern folded to plain ASCII)]
_T3_BY_ID: dict[str, list[tuple[re.Pattern[str], re.Pattern[str]]]] = {rid: [] for rid in _ORDER}
for _rid, _patterns in _BASE + _DRAFT:
    for _p in _patterns:
        _T3_BY_ID[_rid].append((re.compile(_p), re.compile(_fold(_p))))


def match(raw: str) -> str | None:
    """Return the script id for the message, or None to hand it to the LLM."""
    text = unicodedata.normalize("NFC", raw).lower()
    folded = _fold(raw)
    # Only fall back to unaccented matching when the mother typed without diacritics,
    # so that e.g. "từ từ" is not mistaken for "tự tử".
    typed_without_accents = folded == text

    for rid in _ORDER:
        for accented, plain in _T3_BY_ID[rid]:
            if accented.search(text) or (typed_without_accents and plain.search(folded)):
                return rid

    if re.search(r"tăng cân đều|đủ tã", text):
        return "milkok"
    if "sữa" in text and "đủ" in text:
        return "milk"
    if re.search(r"2 tuổi|biếng ăn", text):
        return "oos"
    if "bế" in text and re.search(r"mỏi|cả ngày|đòi", text):
        return "hold"
    if "khóc" in text and re.search(r"chiều|tối|suốt|kiệt", text):
        return "cry"
    return None
