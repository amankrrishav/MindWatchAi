"""recreate human_answers with autoincrement id

Revision ID: 7f3b28132428
Revises: 4003a4890e91
Create Date: 2025-12-20 23:00:05.525897

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f3b28132428'
down_revision: Union[str, Sequence[str], None] = '4003a4890e91'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        "human_answers",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.String, nullable=False),
        sa.Column("question_id", sa.String, nullable=False),
        sa.Column("answer_key", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("human_answers")