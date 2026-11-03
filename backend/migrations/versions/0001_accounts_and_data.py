"""accounts, profile, babies, check-ins, notes

Revision ID: 0001
Revises:
"""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("nickname", sa.String(24), nullable=False),
        sa.Column("nickname_key", sa.String(24), nullable=False, unique=True),
        sa.Column("pin_hash", sa.String(255), nullable=False),
        sa.Column("recovery_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_table(
        "profiles",
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
        ),
        sa.Column("birth_date", sa.Date(), nullable=False),
        sa.Column("birth_type", sa.String(16), nullable=False),
        sa.Column("first_time", sa.Boolean(), nullable=False),
        sa.Column("trusted_name", sa.String(200), nullable=False),
        sa.Column("trusted_phone", sa.String(200), nullable=False),
        sa.Column("trusted_notes", sa.String(200), nullable=False),
    )
    op.create_table(
        "babies",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(40), nullable=False),
        sa.Column("formula", sa.String(8), nullable=True),
        sa.Column("method", sa.String(8), nullable=True),
    )
    op.create_index("ix_babies_user_id", "babies", ["user_id"])
    op.create_table(
        "checkins",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("moods", sa.JSON(), nullable=False),
        sa.Column("sleep", sa.String(40), nullable=True),
        sa.Column("bodies", sa.JSON(), nullable=False),
        sa.Column("stressors", sa.JSON(), nullable=False),
        sa.UniqueConstraint("user_id", "day", name="uq_checkin_user_day"),
    )
    op.create_index("ix_checkins_user_id", "checkins", ["user_id"])
    op.create_table(
        "notes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("topic", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_notes_user_id", "notes", ["user_id"])


def downgrade() -> None:
    for table in ("notes", "checkins", "babies", "profiles", "refresh_tokens", "users"):
        op.drop_table(table)
