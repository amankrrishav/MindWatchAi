"""phase_15_3_answer_phq_mapping

Revision ID: 77a581bb59aa
Revises: 805d176d403c
Create Date: 2025-12-20 21:37:10.529095

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77a581bb59aa'
down_revision: Union[str, Sequence[str], None] = '805d176d403c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'answer_phq_mapping',
        sa.Column('answer_key', sa.String(length=50), primary_key=True),
        sa.Column('phq_score', sa.Integer(), nullable=False),
    )

def downgrade() -> None:
    op.drop_table('answer_phq_mapping')    