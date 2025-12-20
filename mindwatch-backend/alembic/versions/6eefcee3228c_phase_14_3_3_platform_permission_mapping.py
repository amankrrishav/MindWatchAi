"""phase_14_3_3_platform_permission_mapping

Revision ID: 6eefcee3228c
Revises: cac9e1227757
Create Date: 2025-12-20 16:03:42.725166

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6eefcee3228c'
down_revision: Union[str, Sequence[str], None] = 'cac9e1227757'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'platform_permission_mappings',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'capability_key',
            sa.String(length=50),
            nullable=False
        ),

        sa.Column(
            'platform',
            sa.String(length=20),
            nullable=False
        ),
        # android, ios, web, desktop

        sa.Column(
            'permission_key',
            sa.String(length=100),
            nullable=False
        ),
        # e.g. POST_NOTIFICATIONS, UNUserNotification, NotificationAPI

        sa.Column(
            'required',
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
    op.drop_table('platform_permission_mappings')    