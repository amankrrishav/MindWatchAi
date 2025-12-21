"""add question_guardrail_state

Revision ID: 2d803cb0269f
Revises: 7f3b28132428
Create Date: 2025-12-21 14:47:54.376274

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d803cb0269f'
down_revision: Union[str, Sequence[str], None] = '7f3b28132428'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "question_guardrail_state",
        sa.Column("user_id", sa.String, primary_key=True),
        sa.Column("last_question_at", sa.DateTime, nullable=True),
        sa.Column("last_answer_at", sa.DateTime, nullable=True),
        sa.Column("last_skip_at", sa.DateTime, nullable=True),
        sa.Column("questions_today", sa.Integer, nullable=False, server_default="0"),
        sa.Column("skips_today", sa.Integer, nullable=False, server_default="0"),
        sa.Column("cooldown_until", sa.DateTime, nullable=True),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.current_timestamp()),
    )

def downgrade():
    op.drop_table("question_guardrail_state")