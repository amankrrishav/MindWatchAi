"""phase_14_1_2_accounts_auth

Revision ID: d7609b9e4fe9
Revises: b53e79b1397f
Create Date: 2025-12-20 15:15:00.569525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7609b9e4fe9'
down_revision: Union[str, Sequence[str], None] = 'b53e79b1397f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'accounts',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'user_id',
            sa.String(length=36),
            sa.ForeignKey('users.id'),
            nullable=False
        ),

        sa.Column(
            'type',
            sa.String(length=20),
            nullable=False
        ),

        sa.Column(
            'identifier',
            sa.String(length=255),
            nullable=False,
            unique=True
        ),

        sa.Column(
            'password_hash',
            sa.String(length=255),
            nullable=True
        ),

        sa.Column(
            'verified',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('0')
        ),

        sa.Column(
            'status',
            sa.String(length=20),
            nullable=False
        ),

        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),

        sa.Column(
            'last_login_at',
            sa.DateTime(),
            nullable=True
        ),
    )


def downgrade() -> None:
    op.drop_table('accounts')