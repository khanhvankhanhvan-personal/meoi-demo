"""Tables for accounts and the data a mother chooses to keep. Chat transcripts are NOT stored."""

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _now() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nickname: Mapped[str] = mapped_column(String(24))
    nickname_key: Mapped[str] = mapped_column(String(24), unique=True)  # lower-cased, for lookups
    pin_hash: Mapped[str] = mapped_column(String(255))
    recovery_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    # sha256 hex of the token; the token itself is never stored.
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    birth_date: Mapped[date] = mapped_column(Date)
    birth_type: Mapped[str] = mapped_column(String(16))
    first_time: Mapped[bool] = mapped_column(Boolean)
    csection_kind: Mapped[str | None] = mapped_column(String(12), nullable=True)
    recovery_feel: Mapped[str | None] = mapped_column(String(16), nullable=True)
    support_needs: Mapped[list[str]] = mapped_column(JSON, default=list, server_default="[]")
    trusted_name: Mapped[str] = mapped_column(String(200), default="")
    trusted_phone: Mapped[str] = mapped_column(String(200), default="")
    trusted_notes: Mapped[str] = mapped_column(String(200), default="")


class Baby(Base):
    __tablename__ = "babies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(40), default="")
    formula: Mapped[str | None] = mapped_column(String(8), nullable=True)
    method: Mapped[str | None] = mapped_column(String(8), nullable=True)


class Checkin(Base):
    __tablename__ = "checkins"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_checkin_user_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    day: Mapped[date] = mapped_column(Date)
    moods: Mapped[list[str]] = mapped_column(JSON)
    sleep: Mapped[str | None] = mapped_column(String(40), nullable=True)
    bodies: Mapped[list[str]] = mapped_column(JSON)
    stressors: Mapped[list[str]] = mapped_column(JSON)
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    day: Mapped[date] = mapped_column(Date)
    text: Mapped[str] = mapped_column(Text)
    topic: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
