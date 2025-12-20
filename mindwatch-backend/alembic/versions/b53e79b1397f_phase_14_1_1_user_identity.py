"""phase_14_1_1_user_identity

Revision ID: b53e79b1397f
Revises:
Create Date: 2025-12-20 15:04:13.598792
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b53e79b1397f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False
        ),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('risk_profile_version', sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('users')