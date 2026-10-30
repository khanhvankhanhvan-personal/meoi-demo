"""System prompt loading and the dynamic context blocks appended to it on every turn."""

import re
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from app.hours import VN_TZ, hope_open

_PROMPT_FILE = Path(__file__).parent / "prompts" / "system_prompt_vi.md"

_METHOD_TEXT = {"direct": "bú trực tiếp", "pump": "ti bình", "both": "song song cả hai cách"}


class BabyIn(BaseModel):
    label: str = Field("", max_length=40)
    formula: Literal["mom", "only", "mix"] | None = None
    method: Literal["direct", "pump", "both"] | None = None


class ProfileIn(BaseModel):
    birth_date: date | None = None
    birth_type: Literal["normal", "csection"] | None = None
    first_time: bool | None = None
    babies: list[BabyIn] = Field(default_factory=list, max_length=4)


@lru_cache(maxsize=1)
def load_system_prompt() -> str:
    return _PROMPT_FILE.read_text(encoding="utf-8")


def _clean(text: str) -> str:
    """Free text from the client goes into the prompt: keep it on one short line."""
    return re.sub(r"\s+", " ", text).strip()[:40]


def _feed_text(baby: BabyIn) -> str:
    method = f" ({_METHOD_TEXT[baby.method]})" if baby.method else ""
    if baby.formula == "only":
        return "chỉ sữa công thức"
    if baby.formula == "mix":
        return f"kết hợp sữa mẹ{method} và sữa công thức"
    if baby.formula == "mom":
        return f"sữa mẹ hoàn toàn{method}"
    return "chưa rõ"


def profile_block(profile: ProfileIn | None, now: datetime) -> str:
    """Same content as the prototype's profileBlock(); empty unless the birth type is known."""
    if profile is None or profile.birth_type is None:
        return ""
    birth_type = "sinh mổ" if profile.birth_type == "csection" else "sinh thường"
    weeks = ""
    if profile.birth_date is not None:
        days = max(0, (now.astimezone(VN_TZ).date() - profile.birth_date).days)
        weeks = f" {days // 7} tuần trước"
    out = f"\n\n## Hồ sơ: Lần sinh gần nhất{weeks} ({birth_type})."
    for i, baby in enumerate(profile.babies, start=1):
        label = f" ({_clean(baby.label)})" if _clean(baby.label) else ""
        out += f"\nBé {i}{label}: tình trạng bú {_feed_text(baby)}."
    if profile.first_time is not None:
        out += (
            "\nSố lần sinh: "
            + ("lần đầu làm mẹ" if profile.first_time else "đã từng sinh con trước đó")
            + "."
        )
    return out


def time_block(now: datetime) -> str:
    """Tells the model whether HOPE is open, so it never promises an unavailable line."""
    local = now.astimezone(VN_TZ)
    status = "đang mở" if hope_open(now) else "đã đóng (chỉ nhắc 115 hoặc bệnh viện gần nhất)"
    return f"\n\n## Giờ hiện tại\nBây giờ là {local:%H:%M} (giờ Việt Nam). Đường dây HOPE {status}."


def build_system_prompt(profile: ProfileIn | None, now: datetime) -> str:
    return load_system_prompt().rstrip("\n") + profile_block(profile, now) + time_block(now)
