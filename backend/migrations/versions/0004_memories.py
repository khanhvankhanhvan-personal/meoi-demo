"""mother's memory: memories and memory_settings

Revision ID: 0004
Revises: 0003
"""

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "memories",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("text", sa.String(200), nullable=False),
        sa.Column("category", sa.String(12), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_memories_user_id", "memories", ["user_id"])
    op.create_table(
        "memory_settings",
        sa.Column(
            "user_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("topics", sa.JSON(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("memory_settings")
    op.drop_index("ix_memories_user_id", table_name="memories")
    op.drop_table("memories")
