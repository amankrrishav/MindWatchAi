"""phase_14_2_2_consent_toggles

Revision ID: c61058475c26
Revises: 5e2aea3912c8
Create Date: 2025-12-20 15:33:41.121018

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c61058475c26'
down_revision: Union[str, Sequence[str], None] = '5e2aea3912c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'consent_toggles',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'consent_id',
            sa.String(length=36),
            sa.ForeignKey('consents.id'),
            nullable=False
        ),

        sa.Column(
            'toggle_key',
            sa.String(length=50),
            nullable=False
        ),
        # e.g. signals, notifications, questionnaires, passive_signals

        sa.Column(
            'enabled',
            sa.Boolean(),
            nullable=False
        ),

        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),
    )

def downgrade() -> None:
    op.drop_table('consent_toggles')    