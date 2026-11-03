"""PIN / recovery-code hashing (argon2id), signed access tokens, and attempt limiting."""

import hashlib
import os
import secrets
import threading
import time
from collections.abc import Callable
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

_hasher = PasswordHasher()  # argon2id with the library's recommended parameters

ACCESS_TTL = timedelta(minutes=15)
REFRESH_TTL = timedelta(days=30)

_RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O/1/I


def hash_secret(plain: str) -> str:
    return _hasher.hash(plain)


def verify_secret(hashed: str, plain: str) -> bool:
    try:
        return _hasher.verify(hashed, plain)
    except (VerificationError, InvalidHashError):
        return False


# Verified when a nickname does not exist, so a wrong nickname costs the same time as a wrong PIN.
_DUMMY_HASH = hash_secret("000000")


def verify_dummy(plain: str) -> None:
    verify_secret(_DUMMY_HASH, plain)


def new_recovery_code() -> str:
    raw = "".join(secrets.choice(_RECOVERY_ALPHABET) for _ in range(16))
    return "-".join(raw[i : i + 4] for i in range(0, 16, 4))


def normalize_recovery_code(code: str) -> str:
    return "".join(ch for ch in code.upper() if ch.isalnum())


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def _jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET", "")
    if len(secret) < 16:
        raise RuntimeError("JWT_SECRET is missing or too short")
    return secret


def make_access_token(user_id: str, now: datetime | None = None) -> str:
    now = now or datetime.now(UTC)
    claims = {"sub": user_id, "iat": now, "exp": now + ACCESS_TTL}
    return jwt.encode(claims, _jwt_secret(), "HS256")


def read_access_token(token: str) -> str | None:
    try:
        claims = jwt.decode(
            token, _jwt_secret(), algorithms=["HS256"], options={"require": ["exp", "sub"]}
        )
    except jwt.PyJWTError:
        return None
    sub = claims.get("sub")
    return sub if isinstance(sub, str) else None


Clock = Callable[[], float]


class LockoutLimiter:
    """Exponential lockout: free tries, then 1, 2, 4... minutes (max 1 hour) per further failure.

    In memory, so it resets on restart and is per instance; fine for a single-instance beta
    (ADR-006). Keys are used whether or not the nickname exists, so a lock never reveals which
    nicknames exist.
    """

    def __init__(self, free_tries: int, clock: Clock = time.monotonic) -> None:
        self.free_tries = free_tries
        self.clock = clock
        self._fails: dict[str, int] = {}
        self._until: dict[str, float] = {}
        self._last: dict[str, float] = {}
        self._lock = threading.Lock()

    def retry_after(self, key: str) -> int:
        """Seconds still to wait, 0 if the key may try now."""
        with self._lock:
            return max(0, int(self._until.get(key, 0) - self.clock() + 0.999))

    def fail(self, key: str) -> None:
        with self._lock:
            if len(self._fails) > 20000:
                self._prune()
            now = self.clock()
            # Failures older than an hour are forgotten, so a shared IP is not penalised forever.
            if now - self._last.get(key, now) > 3600:
                self._fails.pop(key, None)
            self._last[key] = now
            n = self._fails.get(key, 0) + 1
            self._fails[key] = n
            if n > self.free_tries:
                wait = min(60 * 2 ** (n - self.free_tries - 1), 3600)
                self._until[key] = self.clock() + wait

    def success(self, key: str) -> None:
        with self._lock:
            self._fails.pop(key, None)
            self._until.pop(key, None)
            self._last.pop(key, None)

    def reset(self) -> None:
        with self._lock:
            self._fails.clear()
            self._until.clear()
            self._last.clear()

    def _prune(self) -> None:
        now = self.clock()
        for k in [k for k, t in self._until.items() if t < now]:
            self._until.pop(k, None)
            self._fails.pop(k, None)
            self._last.pop(k, None)


class WindowLimiter:
    """At most `limit` events per `window` seconds per key (used for sign-ups)."""

    def __init__(self, limit: int, window: float, clock: Clock = time.monotonic) -> None:
        self.limit = limit
        self.window = window
        self.clock = clock
        self._events: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        with self._lock:
            now = self.clock()
            recent = [t for t in self._events.get(key, []) if now - t < self.window]
            if len(recent) >= self.limit:
                self._events[key] = recent
                return False
            recent.append(now)
            self._events[key] = recent
            return True

    def reset(self) -> None:
        with self._lock:
            self._events.clear()


# PIN checks (login, reset, delete account): 5 free tries per nickname, 20 per IP.
nickname_lockout = LockoutLimiter(free_tries=4)  # the 5th wrong try starts the lock
ip_lockout = LockoutLimiter(free_tries=19)  # the 20th starts the lock
signup_limiter = WindowLimiter(limit=10, window=3600)
