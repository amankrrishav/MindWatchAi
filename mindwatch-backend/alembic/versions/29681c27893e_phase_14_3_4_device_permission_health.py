"""phase_14_3_4_device_permission_health

Revision ID: 29681c27893e
Revises: 6eefcee3228c
Create Date: 2025-12-20 16:08:09.723123

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '29681c27893e'
down_revision: Union[str, Sequence[str], None] = '6eefcee3228c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'device_permission_health',
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

        sa.Column(
            'status',
            sa.String(length=20),
            nullable=False
        ),
        # granted, denied, restricted, unknown

        sa.Column(
            'last_checked_at',
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
    op.drop_table('device_permission_health')    