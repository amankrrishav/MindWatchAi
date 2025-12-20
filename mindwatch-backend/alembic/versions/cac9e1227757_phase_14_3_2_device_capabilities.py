"""phase_14_3_2_device_capabilities

Revision ID: cac9e1227757
Revises: d560239317a7
Create Date: 2025-12-20 16:01:30.487590

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cac9e1227757'
down_revision: Union[str, Sequence[str], None] = 'd560239317a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'device_capabilities',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'device_id',
            sa.String(length=36),
            sa.ForeignKey('devices.id'),
            nullable=False
        ),

        sa.Column(
            'capability_key',
            sa.String(length=50),
            nullable=False
        ),
        # e.g. notifications, questionnaires, passive_signals

        sa.Column(
            'supported',
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
    op.drop_table('device_capabilities')    