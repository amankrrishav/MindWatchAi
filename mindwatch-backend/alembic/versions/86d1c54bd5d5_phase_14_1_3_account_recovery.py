"""phase_14_1_3_account_recovery

Revision ID: 86d1c54bd5d5
Revises: d7609b9e4fe9
Create Date: 2025-12-20 15:20:17.880755

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86d1c54bd5d5'
down_revision: Union[str, Sequence[str], None] = 'd7609b9e4fe9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'account_recovery_tokens',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'account_id',
            sa.String(length=36),
            sa.ForeignKey('accounts.id'),
            nullable=False
        ),

        sa.Column(
            'token',
            sa.String(length=255),
            nullable=False,
            unique=True
        ),

        sa.Column(
            'expires_at',
            sa.DateTime(),
            nullable=False
        ),

        sa.Column(
            'used',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('0')
        ),

        sa.Column(
            'used_at',
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
    op.drop_table('account_recovery_tokens')    