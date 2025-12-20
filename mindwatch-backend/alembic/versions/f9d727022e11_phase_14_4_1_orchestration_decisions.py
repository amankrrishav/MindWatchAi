"""phase_14_4_1_orchestration_decisions

Revision ID: f9d727022e11
Revises: 29681c27893e
Create Date: 2025-12-20 16:13:29.868508

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9d727022e11'
down_revision: Union[str, Sequence[str], None] = '29681c27893e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'orchestration_decisions',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'user_id',
            sa.String(length=36),
            sa.ForeignKey('users.id'),
            nullable=False
        ),

        sa.Column(
            'decision',
            sa.String(length=20),
            nullable=False
        ),
        # ask, dont_ask

        sa.Column(
            'confidence_score',
            sa.Float(),
            nullable=False
        ),
        # 0.0 → 1.0

        sa.Column(
            'uncertainty_reason',
            sa.String(length=255),
            nullable=True
        ),

        sa.Column(
            'explanation',
            sa.String(length=255),
            nullable=False
        ),
        # human-readable rationale

        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),
    )

def downgrade() -> None:
    op.drop_table('orchestration_decisions')    