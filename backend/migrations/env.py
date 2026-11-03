"""Alembic environment: the database URL comes from DATABASE_URL (never from a file)."""

import os

from alembic import context
from sqlalchemy import create_engine

import app.models  # noqa: F401  (registers the tables on Base.metadata)
from app.db import Base, normalize_url

target_metadata = Base.metadata


def _url() -> str:
    # Tests pass an engine/URL through the config; production reads the environment.
    url = context.config.get_main_option("sqlalchemy.url") or os.environ.get("DATABASE_URL", "")
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    return normalize_url(url)


def run_migrations_online() -> None:
    connectable = create_engine(_url())
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
