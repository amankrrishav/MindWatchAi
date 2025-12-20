"""phase_15_3_human_answers

Revision ID: 48599f6f61a4
Revises: 77a581bb59aa
Create Date: 2025-12-20 21:40:16.723496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '48599f6f61a4'
down_revision: Union[str, Sequence[str], None] = '77a581bb59aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'human_answers',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'user_id',
            sa.String(length=36),
            sa.ForeignKey('users.id'),
            nullable=False
        ),

        sa.Column(
            'question_id',
            sa.String(length=36),
            sa.ForeignKey('human_questions.id'),
            nullable=False
        ),

        sa.Column(
            'answer_key',
            sa.String(length=50),
            nullable=False
        ),

        sa.Column(
            'phq_score',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'answered_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),
    )

def downgrade() -> None:
    op.drop_table('human_answers')    