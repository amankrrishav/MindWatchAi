"""recreate answer_phq_mapping with id primary key

Revision ID: 39b6afc93f65
Revises: 3254e21e52a6
Create Date: 2025-12-20 22:46:32.886218

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39b6afc93f65'
down_revision: Union[str, Sequence[str], None] = '3254e21e52a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        "answer_phq_mapping",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("clinical_key", sa.String, nullable=False),
        sa.Column("answer_key", sa.String, nullable=False),
        sa.Column("phq_score", sa.Integer, nullable=False),
    )


def downgrade():
    op.drop_table("answer_phq_mapping")