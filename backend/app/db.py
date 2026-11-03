"""Database access. The engine is built lazily from DATABASE_URL (guest-only runs need no DB)."""

import os
from collections.abc import Iterator

from fastapi import HTTPException
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


def normalize_url(url: str) -> str:
    """Hosts hand out `postgres://` / `postgresql://`; we use the psycopg 3 driver."""
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix) :]
    return url


_engine: Engine | None = None


def get_engine() -> Engine | None:
    global _engine
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        return None
    if _engine is None:
        _engine = create_engine(normalize_url(url), pool_pre_ping=True)
    return _engine


def get_db() -> Iterator[Session]:
    engine = get_engine()
    if engine is None:
        raise HTTPException(status_code=503, detail="Tài khoản chưa được bật trên máy chủ này.")
    with sessionmaker(engine, expire_on_commit=False)() as session:
        yield session
