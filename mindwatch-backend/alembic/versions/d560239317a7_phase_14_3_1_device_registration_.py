"""phase_14_3_1_device_registration_metadata

Revision ID: d560239317a7
Revises: e9cd3ec47110
Create Date: 2025-12-20 15:44:30.541659

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd560239317a7'
down_revision: Union[str, Sequence[str], None] = 'e9cd3ec47110'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add registered_at (SQLite-safe: no default)
    op.add_column(
        'devices',
        sa.Column(
            'registered_at',
            sa.DateTime(),
            nullable=True
        )
    )

    # Add last_trust_check_at
    op.add_column(
        'devices',
        sa.Column(
            'last_trust_check_at',
            sa.DateTime(),
            nullable=True
        )
    )

    # Backfill registered_at for existing rows
    op.execute(
        "UPDATE devices SET registered_at = CURRENT_TIMESTAMP WHERE registered_at IS NULL"
    )

def downgrade() -> None:
    op.drop_column('devices', 'last_trust_check_at')
    op.drop_column('devices', 'registered_at')
    op.drop_column('devices', 'registration_method')    