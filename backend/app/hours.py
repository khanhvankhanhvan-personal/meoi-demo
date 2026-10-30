"""Hotline opening hours, always computed server-side in Vietnam time.

Source: docs/content-framework-v2-vi.md section 2. The start of a window is inclusive and the end is
exclusive, so at exactly 20:30 we already tell the mother the line is closed (the cautious choice).
"""

from datetime import datetime, time
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

_HOPE_OPEN = time(16, 30)
_HOPE_CLOSE = time(20, 30)
_NGAY_MAI_OPEN = time(13, 0)
_NGAY_MAI_CLOSE = time(20, 30)
_NGAY_MAI_DAYS = {2, 3, 4, 5, 6}  # Wed..Sun (Monday == 0); closed Mon and Tue


def _to_vn(now: datetime) -> datetime:
    if now.tzinfo is None:
        raise ValueError("now must be timezone-aware")
    return now.astimezone(VN_TZ)


def hope_open(now: datetime) -> bool:
    """HOPE: every day 16:30-20:30."""
    return _HOPE_OPEN <= _to_vn(now).time() < _HOPE_CLOSE


def ngay_mai_open(now: datetime) -> bool:
    """Ngày Mai: Wed-Sun 13:00-20:30, closed Mon and Tue."""
    local = _to_vn(now)
    return local.weekday() in _NGAY_MAI_DAYS and _NGAY_MAI_OPEN <= local.time() < _NGAY_MAI_CLOSE
