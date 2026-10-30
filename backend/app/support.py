"""GET /support: emergency/support contacts with opening status computed in Vietnam time."""

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.chat import get_now
from app.hours import hope_open

router = APIRouter()


class SupportContact(BaseModel):
    key: str
    name: str
    phone: str
    hours: str
    status: Literal["open", "closed"] | None  # None = no hours-based status (24/7 or office hours)
    urgent: bool = False


class SupportOut(BaseModel):
    hope_open: bool
    contacts: list[SupportContact]


@router.get("/support", response_model=SupportOut)
def support(now: datetime = Depends(get_now)) -> SupportOut:
    hope = hope_open(now)
    return SupportOut(
        hope_open=hope,
        contacts=[
            SupportContact(
                key="emergency",
                name="Cấp cứu 115",
                phone="115",
                hours="24/7",
                status=None,
                urgent=True,
            ),
            SupportContact(
                key="hope",
                name="HOPE · hỗ trợ tâm lý",
                phone="0865044400",
                hours="Hằng ngày 16:30–20:30",
                status="open" if hope else "closed",
            ),
            SupportContact(
                key="child", name="Tổng đài Bảo vệ Trẻ em", phone="111", hours="24/7", status=None
            ),
            SupportContact(
                key="csaga", name="CSAGA", phone="02433335599", hours="Giờ hành chính", status=None
            ),
            SupportContact(
                key="peace",
                name="Ngôi nhà Bình yên",
                phone="1900969680",
                hours="24/7 · điện thoại hoặc SMS",
                status=None,
            ),
        ],
    )
