"""add created_at to human_answers

Revision ID: 4003a4890e91
Revises: 39b6afc93f65
Create Date: 2025-12-20 22:50:02.535259

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4003a4890e91'
down_revision: Union[str, Sequence[str], None] = '39b6afc93f65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op
import sqlalchemy as sa


def upgrade():
    # Step 1: add column WITHOUT default and nullable
    op.add_column(
        "human_answers",
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True
        )
    )

    # Step 2: backfill existing rows
    op.execute(
        "UPDATE human_answers SET created_at = CURRENT_TIMESTAMP "
        "WHERE created_at IS NULL"
    )


def downgrade():
    op.drop_column("human_answers", "created_at")