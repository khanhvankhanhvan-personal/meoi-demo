from datetime import UTC, datetime

import pytest

from app.hours import VN_TZ, hope_open, ngay_mai_open


def vn(y: int, m: int, d: int, hh: int, mm: int) -> datetime:
    return datetime(y, m, d, hh, mm, tzinfo=VN_TZ)


# 2026-11-02 is a Monday.
@pytest.mark.parametrize(
    "hh,mm,expected",
    [
        (16, 29, False),
        (16, 30, True),
        (18, 0, True),
        (20, 29, True),
        (20, 30, False),
        (3, 0, False),
    ],
)
def test_hope_hours_boundaries(hh: int, mm: int, expected: bool) -> None:
    assert hope_open(vn(2026, 11, 2, hh, mm)) is expected


def test_hope_is_computed_in_vietnam_time_not_utc() -> None:
    # 10:00 UTC == 17:00 in Vietnam -> open; 18:00 UTC == 01:00 next day -> closed
    assert hope_open(datetime(2026, 11, 2, 10, 0, tzinfo=UTC)) is True
    assert hope_open(datetime(2026, 11, 2, 18, 0, tzinfo=UTC)) is False
    # 09:30 UTC == 16:30 VN
    assert hope_open(datetime(2026, 11, 2, 9, 30, tzinfo=UTC)) is True


def test_hope_open_every_day() -> None:
    for day in range(2, 9):  # Mon 2 Nov .. Sun 8 Nov
        assert hope_open(vn(2026, 11, day, 17, 0))


@pytest.mark.parametrize(
    "day,expected", [(2, False), (3, False), (4, True), (5, True), (6, True), (7, True), (8, True)]
)
def test_ngay_mai_closed_monday_and_tuesday(day: int, expected: bool) -> None:
    assert ngay_mai_open(vn(2026, 11, day, 15, 0)) is expected


@pytest.mark.parametrize(
    "hh,mm,expected", [(12, 59, False), (13, 0, True), (20, 29, True), (20, 30, False)]
)
def test_ngay_mai_hours_on_open_day(hh: int, mm: int, expected: bool) -> None:
    assert ngay_mai_open(vn(2026, 11, 4, hh, mm)) is expected  # Wednesday


def test_naive_datetime_is_rejected() -> None:
    with pytest.raises(ValueError):
        hope_open(datetime(2026, 11, 2, 17, 0))
