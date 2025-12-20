"""phase_14_2_4_pause_revoke_consent

Revision ID: e9cd3ec47110
Revises: 7ba256a84fac
Create Date: 2025-12-20 15:40:38.490374

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e9cd3ec47110'
down_revision: Union[str, Sequence[str], None] = '7ba256a84fac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'consents',
        sa.Column(
            'state',
            sa.String(length=20),
            nullable=False,
            server_default='active'
        )
    )

    op.add_column(
        'consents',
        sa.Column(
            'paused_at',
            sa.DateTime(),
            nullable=True
        )
    )

    op.add_column(
        'consents',
        sa.Column(
            'revoked_at',
            sa.DateTime(),
            nullable=True
        )
    )

def downgrade() -> None:
    op.drop_column('consents', 'revoked_at')
    op.drop_column('consents', 'paused_at')
    op.drop_column('consents', 'state')    