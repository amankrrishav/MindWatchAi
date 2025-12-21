"""add notification_intents table

Revision ID: 135616fdf43b
Revises: 2d803cb0269f
Create Date: 2025-12-21 15:58:10.040729

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '135616fdf43b'
down_revision: Union[str, Sequence[str], None] = '2d803cb0269f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "notification_intents",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), nullable=False, index=True),

        sa.Column("intent_type", sa.String(length=50), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),

        sa.Column("silent_allowed", sa.Boolean(), nullable=False, server_default=sa.true()),

        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),

        sa.Column("suppressed", sa.Boolean(), nullable=False, server_default=sa.false()),

        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("handled_at", sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table("notification_intents")