"""phase_14_2_1_consent_definitions

Revision ID: 5e2aea3912c8
Revises: 16860454bb26
Create Date: 2025-12-20 15:30:03.503145

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e2aea3912c8'
down_revision: Union[str, Sequence[str], None] = '16860454bb26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'consents',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'user_id',
            sa.String(length=36),
            sa.ForeignKey('users.id'),
            nullable=False
        ),

        sa.Column(
            'consent_type',
            sa.String(length=50),
            nullable=False
        ),
        # e.g. monitoring, notifications, questionnaires, passive_signals

        sa.Column(
            'purpose',
            sa.String(length=255),
            nullable=False
        ),
        # human-readable explanation

        sa.Column(
            'granted',
            sa.Boolean(),
            nullable=False
        ),

        sa.Column(
            'valid_from',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),

        sa.Column(
            'valid_until',
            sa.DateTime(),
            nullable=True
        ),

        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),
    )

def downgrade() -> None:
    op.drop_table('consents')    