from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.sqlite import BLOB


# revision identifiers, used by Alembic.
revision: str = 'c0fec94bee37'
down_revision: Union[str, Sequence[str], None] = '48599f6f61a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -------------------------------
    # Orchestration Decisions (Phase 14.4)
    # -------------------------------
    op.create_table(
        "orchestration_decisions",
        sa.Column("id", BLOB, primary_key=True),
        sa.Column("user_id", sa.String(), nullable=False, index=True),
        sa.Column("decision", sa.String(), nullable=False),  # ask / dont_ask
        sa.Column("uncertainty_reason", sa.String(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # -------------------------------
    # Human Questions (Phase 15)
    # -------------------------------
    op.create_table(
        "human_questions",
        sa.Column("id", sa.String(), primary_key=True),  # q-1, q-2, etc.
        sa.Column("clinical_key", sa.String(), nullable=False),
        sa.Column("question_text", sa.String(), nullable=False),
        sa.Column("risk_level", sa.String(), nullable=False),
        sa.Column(
            "active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("human_questions")
    op.drop_table("orchestration_decisions")