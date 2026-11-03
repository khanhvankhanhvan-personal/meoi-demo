import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models as _models  # noqa: F401  (registers the tables)
from app.db import Base, get_db
from app.main import app
from app.security import ip_lockout, nickname_lockout, signup_limiter


@pytest.fixture
def engine() -> Iterator[Engine]:
    """Accounts are tested on in-memory SQLite (no server needed); CI also runs them on Postgres."""
    url = os.environ.get("TEST_DATABASE_URL")
    eng = (
        create_engine(url)
        if url
        else create_engine(
            "sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
    )
    Base.metadata.drop_all(eng)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)


@pytest.fixture
def client(engine: Engine, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setenv("JWT_SECRET", "test-secret-test-secret-test-secret")
    monkeypatch.setenv("COOKIE_SECURE", "0")  # the test client talks plain http
    factory = sessionmaker(engine, expire_on_commit=False)

    def _db() -> Iterator[Session]:
        with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _db
    for limiter in (nickname_lockout, ip_lockout, signup_limiter):
        limiter.reset()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_db, None)
