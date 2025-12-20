"""phase_14_1_4_devices

Revision ID: 16860454bb26
Revises: 86d1c54bd5d5
Create Date: 2025-12-20 15:25:54.445364

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '16860454bb26'
down_revision: Union[str, Sequence[str], None] = '86d1c54bd5d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'devices',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'user_id',
            sa.String(length=36),
            sa.ForeignKey('users.id'),
            nullable=False
        ),

        sa.Column(
            'platform',
            sa.String(length=20),
            nullable=False
        ),

        sa.Column(
            'device_fingerprint',
            sa.String(length=255),
            nullable=False
        ),

        sa.Column(
            'trusted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('0')
        ),

        sa.Column(
            'first_seen_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),

        sa.Column(
            'last_seen_at',
            sa.DateTime(),
            nullable=True
        ),

        sa.Column(
            'status',
            sa.String(length=20),
            nullable=False
        ),
    )

def downgrade() -> None:
    op.drop_table('devices')    