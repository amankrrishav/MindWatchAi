"""remove legacy confidence_score column

Revision ID: 3254e21e52a6
Revises: fc788cef36e5
Create Date: 2025-12-20 22:39:53.346981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3254e21e52a6'
down_revision: Union[str, Sequence[str], None] = 'fc788cef36e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_column("orchestration_decisions", "confidence_score")

def downgrade():
    op.add_column(
        "orchestration_decisions",
        sa.Column("confidence_score", sa.Float(), nullable=False)
    )