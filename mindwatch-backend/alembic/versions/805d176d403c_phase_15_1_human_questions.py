"""phase_15_1_human_questions

Revision ID: 805d176d403c
Revises: f9d727022e11
Create Date: 2025-12-20 21:30:23.047523

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '805d176d403c'
down_revision: Union[str, Sequence[str], None] = 'f9d727022e11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'human_questions',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'clinical_key',
            sa.String(length=50),
            nullable=False
        ),
        # e.g. anhedonia, mood, sleep, energy, self_worth

        sa.Column(
            'question_text',
            sa.String(length=255),
            nullable=False
        ),

        sa.Column(
            'risk_level',
            sa.String(length=20),
            nullable=False
        ),
        # low, medium, high

        sa.Column(
            'active',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('1')
        ),

        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),
    )

def downgrade() -> None:
    op.drop_table('human_questions')    