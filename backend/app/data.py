"""What a signed-in mother keeps: profile, babies, trusted contact, check-ins and pinned notes.

Chat messages are never stored. A pinned note is the assistant's answer the mother chose to keep.
Tier 3 content can never be pinned: the server refuses it even if the client is modified.
"""

import logging
import uuid
from datetime import date, datetime, timedelta
from typing import Annotated, Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.auth import CurrentUser
from app.db import get_db
from app.models import Baby, Checkin, Note, Profile
from app.replies import is_tier3
from app.safety import match

logger = logging.getLogger(__name__)
router = APIRouter(tags=["data"])
DB = Annotated[Session, Depends(get_db)]

MAX_NOTES = 200
_VN = ZoneInfo("Asia/Ho_Chi_Minh")


def _today() -> date:
    return datetime.now(_VN).date()


class BabyIO(BaseModel):
    label: str = Field(default="", max_length=40)
    formula: Literal["mom", "only", "mix"] | None = None
    method: Literal["direct", "pump", "both", "latch", "bottle"] | None = None


class ProfileIO(BaseModel):
    birth_date: date
    birth_type: Literal["normal", "csection"]
    first_time: bool
    csection_kind: Literal["planned", "emergency"] | None = None
    recovery_feel: Literal["wound_pain", "ok", "exhausted", "need_help"] | None = None
    support_needs: list[Literal["night_listen", "breastfeeding", "exhaustion"]] = Field(
        default_factory=list, max_length=3
    )

    @field_validator("support_needs")
    @classmethod
    def _unique(cls, v: list[str]) -> list[str]:
        if len(set(v)) != len(v):
            raise ValueError("support_needs must not repeat")
        return v

    @field_validator("birth_date")
    @classmethod
    def _plausible(cls, d: date) -> date:
        if d > _today() + timedelta(days=1) or d < _today() - timedelta(days=366 * 4):
            raise ValueError("birth_date out of range")
        return d


class TrustedIO(BaseModel):
    name: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=200)
    notes: str = Field(default="", max_length=200)


class ProfileDoc(BaseModel):
    profile: ProfileIO | None
    babies: list[BabyIO] = Field(min_length=1, max_length=4)
    trusted: TrustedIO = TrustedIO()


@router.get("/profile", response_model=ProfileDoc)
def get_profile(user: CurrentUser, db: DB) -> ProfileDoc:
    row = db.get(Profile, user.id)
    babies = db.scalars(select(Baby).where(Baby.user_id == user.id).order_by(Baby.position)).all()
    if row is None:
        return ProfileDoc(
            profile=None,
            babies=[BabyIO.model_validate(b, from_attributes=True) for b in babies] or [BabyIO()],
        )
    return ProfileDoc(
        profile=ProfileIO.model_validate(row, from_attributes=True),
        babies=[BabyIO.model_validate(b, from_attributes=True) for b in babies] or [BabyIO()],
        trusted=TrustedIO(name=row.trusted_name, phone=row.trusted_phone, notes=row.trusted_notes),
    )


@router.put("/profile", response_model=ProfileDoc)
def put_profile(body: ProfileDoc, user: CurrentUser, db: DB) -> ProfileDoc:
    if body.profile is None:
        raise HTTPException(422, "profile is required")
    row = db.get(Profile, user.id) or Profile(user_id=user.id)
    row.birth_date = body.profile.birth_date
    row.birth_type = body.profile.birth_type
    row.first_time = body.profile.first_time
    row.csection_kind = body.profile.csection_kind
    row.recovery_feel = body.profile.recovery_feel
    row.support_needs = list(body.profile.support_needs)
    row.trusted_name, row.trusted_phone, row.trusted_notes = (
        body.trusted.name,
        body.trusted.phone,
        body.trusted.notes,
    )
    db.add(row)
    db.execute(delete(Baby).where(Baby.user_id == user.id))
    for position, b in enumerate(body.babies):
        db.add(
            Baby(
                user_id=user.id,
                position=position,
                label=b.label,
                formula=b.formula,
                method=b.method,
            )
        )
    db.commit()
    return body


class CheckinIO(BaseModel):
    moods: list[Annotated[str, Field(max_length=60)]] = Field(max_length=12)
    sleep: str | None = Field(default=None, max_length=40)
    bodies: list[Annotated[str, Field(max_length=60)]] = Field(max_length=12)
    stressors: list[Annotated[str, Field(max_length=60)]] = Field(max_length=12)
    note: str | None = Field(default=None, max_length=500)  # private text; never logged


class CheckinOut(CheckinIO):
    day: date


@router.get("/checkins", response_model=list[CheckinOut])
def list_checkins(user: CurrentUser, db: DB) -> list[CheckinOut]:
    rows = db.scalars(select(Checkin).where(Checkin.user_id == user.id).order_by(Checkin.day)).all()
    return [
        CheckinOut(
            day=c.day,
            moods=c.moods,
            sleep=c.sleep,
            bodies=c.bodies,
            stressors=c.stressors,
            note=c.note,
        )
        for c in rows
    ]


@router.put("/checkins/{day}", response_model=CheckinOut)
def put_checkin(day: date, body: CheckinIO, user: CurrentUser, db: DB) -> CheckinOut:
    """One check-in per day, the latest wins."""
    if day > _today() + timedelta(days=1):
        raise HTTPException(422, "day is in the future")
    row = db.scalar(select(Checkin).where(Checkin.user_id == user.id, Checkin.day == day))
    row = row or Checkin(user_id=user.id, day=day)
    row.moods, row.sleep, row.bodies, row.stressors, row.note = (
        body.moods,
        body.sleep,
        body.bodies,
        body.stressors,
        body.note,
    )
    db.add(row)
    db.commit()
    return CheckinOut(day=day, **body.model_dump())


class NoteIn(BaseModel):
    day: date
    text: str = Field(min_length=1, max_length=4000)
    topic: str = Field(default="", max_length=4000)
    tier: str | None = Field(
        default=None, max_length=20
    )  # tier of the assistant message being pinned


class NoteOut(BaseModel):
    id: str
    day: date
    text: str
    topic: str


def _note_out(n: Note) -> NoteOut:
    return NoteOut(id=str(n.id), day=n.day, text=n.text, topic=n.topic)


@router.get("/notes", response_model=list[NoteOut])
def list_notes(user: CurrentUser, db: DB) -> list[NoteOut]:
    rows = db.scalars(select(Note).where(Note.user_id == user.id).order_by(Note.created_at)).all()
    return [_note_out(n) for n in rows]


@router.post("/notes", status_code=201, response_model=NoteOut)
def add_note(body: NoteIn, user: CurrentUser, db: DB) -> NoteOut:
    # Safety invariant: Tier 3 is never pinned. Checked here so a modified client cannot bypass it.
    if is_tier3(body.tier) or match(body.topic) is not None or match(body.text) is not None:
        logger.info("note rejected: tier 3 user=%s", user.id)
        raise HTTPException(
            400, "Nội dung này không lưu được. Mẹ có thể sử dụng nút Hỗ trợ luôn có ở phía trên."
        )
    existing = db.scalar(select(Note).where(Note.user_id == user.id, Note.text == body.text))
    if existing:
        return _note_out(existing)
    if (
        db.scalar(select(func.count()).select_from(Note).where(Note.user_id == user.id)) or 0
    ) >= MAX_NOTES:
        raise HTTPException(409, "Danh sách đã lưu hơi đầy rồi, mẹ lọc bớt các nội dung cũ nhé!")
    note = Note(user_id=user.id, day=body.day, text=body.text, topic=body.topic)
    db.add(note)
    db.commit()
    return _note_out(note)


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: str, user: CurrentUser, db: DB) -> None:
    try:
        key = uuid.UUID(note_id)
    except ValueError as exc:
        raise HTTPException(404, "Không tìm thấy ghi chú.") from exc
    result = db.execute(delete(Note).where(Note.id == key, Note.user_id == user.id))
    db.commit()
    if result.rowcount == 0:  # type: ignore[attr-defined]
        raise HTTPException(404, "Không tìm thấy ghi chú.")
