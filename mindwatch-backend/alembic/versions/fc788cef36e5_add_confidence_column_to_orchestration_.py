"""add confidence column to orchestration_decisions

Revision ID: fc788cef36e5
Revises: c0fec94bee37
Create Date: 2025-12-20 22:37:46.738588

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc788cef36e5'
down_revision: Union[str, Sequence[str], None] = 'c0fec94bee37'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column(
        "orchestration_decisions",
        sa.Column(
            "confidence",
            sa.Float(),
            nullable=False,
            server_default="0.0"
        ),
    )


def downgrade():
    op.drop_column("orchestration_decisions", "confidence")