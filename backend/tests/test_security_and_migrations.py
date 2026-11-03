from pathlib import Path

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine

from app import models as _models  # noqa: F401
from app.db import Base, normalize_url
from app.security import (
    LockoutLimiter,
    WindowLimiter,
    new_recovery_code,
    normalize_recovery_code,
)

BACKEND = Path(__file__).resolve().parent.parent


class Clock:
    def __init__(self) -> None:
        self.t = 1000.0

    def __call__(self) -> float:
        return self.t


def test_lockout_grows_exponentially_and_caps() -> None:
    clock = Clock()
    lim = LockoutLimiter(free_tries=2, clock=clock)
    lim.fail("k")
    lim.fail("k")
    assert lim.retry_after("k") == 0
    waits = []
    for _ in range(8):
        lim.fail("k")
        waits.append(lim.retry_after("k"))
        clock.t += lim.retry_after("k")
    assert waits[:4] == [60, 120, 240, 480]
    assert max(waits) == 3600
    lim.success("k")
    assert lim.retry_after("k") == 0


def test_old_failures_are_forgotten() -> None:
    clock = Clock()
    lim = LockoutLimiter(free_tries=2, clock=clock)
    for _ in range(3):
        lim.fail("k")
    assert lim.retry_after("k") > 0
    clock.t += 7200
    lim.fail("k")  # counted as the first failure again
    assert lim.retry_after("k") == 0


def test_window_limiter() -> None:
    clock = Clock()
    lim = WindowLimiter(limit=2, window=10, clock=clock)
    assert lim.allow("ip") and lim.allow("ip") and not lim.allow("ip")
    clock.t += 11
    assert lim.allow("ip")


def test_recovery_code_format_and_normalising() -> None:
    code = new_recovery_code()
    assert len(code) == 19 and all(len(part) == 4 for part in code.split("-"))
    assert not set(code) & set("01OI")
    assert normalize_recovery_code(code.lower().replace("-", " ")) == code.replace("-", "")
    assert new_recovery_code() != code


def test_normalize_database_url() -> None:
    assert normalize_url("postgres://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_url("postgresql://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_url("sqlite://") == "sqlite://"


def test_migration_matches_the_models(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """`alembic upgrade head` must build exactly the tables the models describe (no drift)."""
    url = f"sqlite:///{tmp_path / 'm.db'}"
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")
    engine = create_engine(url)
    with engine.connect() as conn:
        diff = compare_metadata(MigrationContext.configure(conn), Base.metadata)
    assert diff == []
    command.downgrade(cfg, "base")
