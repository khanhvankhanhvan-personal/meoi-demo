"""Anonymous accounts: nickname + 6-digit PIN, a one-time recovery code, cookie sessions.

No email, no phone. Error messages are generic so they never reveal whether a nickname exists.
Logs carry only an event name and the pseudonymous user id, never a nickname, PIN or code.
"""

import logging
import os
import re
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Baby, Checkin, Memory, MemorySetting, Note, Profile, RefreshToken, User
from app.security import (
    ACCESS_TTL,
    REFRESH_TTL,
    hash_secret,
    hash_token,
    ip_lockout,
    make_access_token,
    new_recovery_code,
    new_refresh_token,
    nickname_lockout,
    normalize_recovery_code,
    read_access_token,
    signup_limiter,
    verify_dummy,
    verify_secret,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])
account_router = APIRouter(tags=["auth"])

ACCESS_COOKIE = "meoi_at"
REFRESH_COOKIE = "meoi_rt"

_NICKNAME = re.compile(r"^[\w .\-]{3,24}$")
DB = Annotated[Session, Depends(get_db)]

BAD_LOGIN = "Biệt danh hoặc mã PIN chưa đúng."
BAD_RECOVERY = "Biệt danh hoặc mã khôi phục chưa đúng."


def _clean_nickname(value: str) -> str:
    value = " ".join(value.split())
    if not _NICKNAME.match(value):
        raise ValueError("Biệt danh dài 3-24 ký tự, chỉ gồm chữ, số, dấu cách, '.', '_' hoặc '-'.")
    return value


class Credentials(BaseModel):
    nickname: str
    pin: str = Field(pattern=r"^\d{6}$")

    _nick = field_validator("nickname")(_clean_nickname)


class ResetIn(BaseModel):
    nickname: str
    recovery_code: str = Field(min_length=8, max_length=40)
    new_pin: str = Field(pattern=r"^\d{6}$")

    _nick = field_validator("nickname")(_clean_nickname)


class PinConfirm(BaseModel):
    pin: str = Field(pattern=r"^\d{6}$")


class UserOut(BaseModel):
    id: str
    nickname: str


class SessionOut(BaseModel):
    user: UserOut
    # Shown exactly once (sign-up / PIN reset). Only its hash is stored.
    recovery_code: str | None = None


def _user_out(user: User) -> UserOut:
    return UserOut(id=str(user.id), nickname=user.nickname)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _secure_cookies() -> bool:
    return os.environ.get("COOKIE_SECURE", "1") != "0"


def _set_cookie(response: Response, name: str, value: str, max_age: int) -> None:
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        secure=_secure_cookies(),
        samesite="lax",
        path="/",
    )


def _start_session(db: Session, response: Response, user: User) -> None:
    refresh = new_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh),
            expires_at=datetime.now(UTC) + REFRESH_TTL,
        )
    )
    db.commit()
    try:
        access = make_access_token(str(user.id))
    except RuntimeError as exc:
        raise HTTPException(503, "Tài khoản chưa được cấu hình trên máy chủ này.") from exc
    _set_cookie(response, ACCESS_COOKIE, access, int(ACCESS_TTL.total_seconds()))
    _set_cookie(response, REFRESH_COOKIE, refresh, int(REFRESH_TTL.total_seconds()))


def _clear_cookies(response: Response) -> None:
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(
            name, path="/", secure=_secure_cookies(), httponly=True, samesite="lax"
        )


def _revoke_all(db: Session, user_id: uuid.UUID) -> None:
    db.execute(update(RefreshToken).where(RefreshToken.user_id == user_id).values(revoked=True))


def current_user(request: Request, db: DB) -> User:
    token = request.cookies.get(ACCESS_COOKIE)
    try:
        sub = read_access_token(token) if token else None
    except RuntimeError as exc:
        raise HTTPException(503, "Tài khoản chưa được cấu hình trên máy chủ này.") from exc
    user = None
    if sub:
        try:
            user = db.get(User, uuid.UUID(sub))
        except ValueError:
            user = None
    if user is None:
        raise HTTPException(401, "Mẹ đăng nhập lại giúp mình nhé.")
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def _guard(keys: list[tuple[str, str]]) -> None:
    """Refuse while any (limiter, key) is locked. Same answer whether or not the nickname exists."""
    wait = max(
        (nickname_lockout if kind == "n" else ip_lockout).retry_after(f"{kind}:{key}")
        for kind, key in keys
    )
    if wait:
        minutes = max(1, -(-wait // 60))
        raise HTTPException(
            429, f"Mẹ thử lại sau khoảng {minutes} phút nhé.", headers={"Retry-After": str(wait)}
        )


def _record_failure(nickname_key: str, ip: str, prefix: str = "") -> None:
    nickname_lockout.fail(f"n:{prefix}{nickname_key}")
    ip_lockout.fail(f"i:{ip}")


@router.post("/register", status_code=201, response_model=SessionOut)
def register(body: Credentials, request: Request, response: Response, db: DB) -> SessionOut:
    if not signup_limiter.allow(_client_ip(request)):
        raise HTTPException(429, "Có quá nhiều lượt tạo tài khoản, mẹ thử lại sau nhé.")
    key = body.nickname.lower()
    if db.scalar(select(User.id).where(User.nickname_key == key)):
        raise HTTPException(409, "Biệt danh này đã có người dùng, mẹ chọn tên khác nhé.")
    recovery = new_recovery_code()
    user = User(
        nickname=body.nickname,
        nickname_key=key,
        pin_hash=hash_secret(body.pin),
        recovery_hash=hash_secret(normalize_recovery_code(recovery)),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "Biệt danh này đã có người dùng, mẹ chọn tên khác nhé.") from exc
    _start_session(db, response, user)
    logger.info("register user=%s", user.id)
    return SessionOut(user=_user_out(user), recovery_code=recovery)


@router.post("/login", response_model=SessionOut)
def login(body: Credentials, request: Request, response: Response, db: DB) -> SessionOut:
    key, ip = body.nickname.lower(), _client_ip(request)
    _guard([("n", f"{key}"), ("i", ip)])
    user = db.scalar(select(User).where(User.nickname_key == key))
    if user is None:
        verify_dummy(body.pin)
        ok = False
    else:
        ok = verify_secret(user.pin_hash, body.pin)
    if user is None or not ok:
        _record_failure(key, ip)
        logger.info("login failed")
        raise HTTPException(401, BAD_LOGIN)
    nickname_lockout.success(f"n:{key}")
    _start_session(db, response, user)
    logger.info("login ok user=%s", user.id)
    return SessionOut(user=_user_out(user))


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, db: DB) -> None:
    token = request.cookies.get(REFRESH_COOKIE)
    if token:
        db.execute(
            update(RefreshToken)
            .where(RefreshToken.token_hash == hash_token(token))
            .values(revoked=True)
        )
        db.commit()
    _clear_cookies(response)


@router.post("/refresh", response_model=SessionOut)
def refresh(request: Request, response: Response, db: DB) -> SessionOut:
    token = request.cookies.get(REFRESH_COOKIE)
    row = (
        db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(token)))
        if token
        else None
    )
    if row is None:
        raise HTTPException(401, "Mẹ đăng nhập lại giúp mình nhé.")
    if row.revoked:
        # A used token came back: someone may have copied it. End every session of this account.
        _revoke_all(db, row.user_id)
        db.commit()
        logger.warning("refresh token reuse user=%s", row.user_id)
        raise HTTPException(401, "Mẹ đăng nhập lại giúp mình nhé.")
    expires = row.expires_at if row.expires_at.tzinfo else row.expires_at.replace(tzinfo=UTC)
    user = db.get(User, row.user_id)
    if expires < datetime.now(UTC) or user is None:
        raise HTTPException(401, "Mẹ đăng nhập lại giúp mình nhé.")
    row.revoked = True
    _start_session(db, response, user)  # commits the revocation together with the new token
    return SessionOut(user=_user_out(user))


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> UserOut:
    return _user_out(user)


@router.post("/reset-pin", response_model=SessionOut)
def reset_pin(body: ResetIn, request: Request, response: Response, db: DB) -> SessionOut:
    """Forgot the PIN: the sign-up recovery code sets a new PIN and issues a NEW recovery code."""
    key, ip = body.nickname.lower(), _client_ip(request)
    _guard([("n", f"r:{key}"), ("i", ip)])
    user = db.scalar(select(User).where(User.nickname_key == key))
    code = normalize_recovery_code(body.recovery_code)
    if user is None:
        verify_dummy(code)
        ok = False
    else:
        ok = verify_secret(user.recovery_hash, code)
    if user is None or not ok:
        _record_failure(key, ip, prefix="r:")
        logger.info("pin reset failed")
        raise HTTPException(401, BAD_RECOVERY)
    nickname_lockout.success(f"n:r:{key}")
    recovery = new_recovery_code()
    user.pin_hash = hash_secret(body.new_pin)
    user.recovery_hash = hash_secret(normalize_recovery_code(recovery))
    _revoke_all(db, user.id)
    _start_session(db, response, user)
    logger.info("pin reset ok user=%s", user.id)
    return SessionOut(user=_user_out(user), recovery_code=recovery)


@account_router.delete("/account", status_code=204)
def delete_account(
    body: PinConfirm, request: Request, response: Response, user: CurrentUser, db: DB
) -> None:
    """Removes the account and everything stored for it. Needs the PIN again."""
    key, ip = user.nickname_key, _client_ip(request)
    _guard([("n", key), ("i", ip)])
    if not verify_secret(user.pin_hash, body.pin):
        _record_failure(key, ip)
        raise HTTPException(401, "Mã PIN chưa đúng.")
    for table in (Memory, MemorySetting, Note, Checkin, Baby, Profile, RefreshToken):
        db.execute(delete(table).where(table.user_id == user.id))
    db.delete(user)
    db.commit()
    _clear_cookies(response)
    logger.info("account deleted user=%s", user.id)
