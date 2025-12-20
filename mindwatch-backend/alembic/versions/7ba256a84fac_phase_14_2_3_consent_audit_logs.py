"""phase_14_2_3_consent_audit_logs

Revision ID: 7ba256a84fac
Revises: c61058475c26
Create Date: 2025-12-20 15:37:17.527703

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ba256a84fac'
down_revision: Union[str, Sequence[str], None] = 'c61058475c26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'consent_audit_logs',
        sa.Column('id', sa.String(length=36), primary_key=True),

        sa.Column(
            'consent_id',
            sa.String(length=36),
            sa.ForeignKey('consents.id'),
            nullable=False
        ),

        sa.Column(
            'action',
            sa.String(length=50),
            nullable=False
        ),
        # e.g. granted, revoked, toggle_enabled, toggle_disabled

        sa.Column(
            'actor',
            sa.String(length=50),
            nullable=False
        ),
        # e.g. user, system, admin

        sa.Column(
            'reason',
            sa.String(length=255),
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
    op.drop_table('consent_audit_logs')    