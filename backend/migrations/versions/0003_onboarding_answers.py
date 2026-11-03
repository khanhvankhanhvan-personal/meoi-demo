"""onboarding answers on the profile: c-section kind, recovery feel, support needs

Revision ID: 0003
Revises: 0002
"""

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("csection_kind", sa.String(12), nullable=True))
    op.add_column("profiles", sa.Column("recovery_feel", sa.String(16), nullable=True))
    op.add_column(
        "profiles",
        sa.Column("support_needs", sa.JSON(), nullable=False, server_default="[]"),
    )


def downgrade() -> None:
    op.drop_column("profiles", "support_needs")
    op.drop_column("profiles", "recovery_feel")
    op.drop_column("profiles", "csection_kind")
