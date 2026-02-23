from datetime import datetime

from app.guardrails.constants import (
    MAX_QUESTIONS_PER_DAY,
    MIN_GAP_BETWEEN_QUESTIONS,
)


def guardrails_blocked(state) -> bool:
    """Return True if we should not show a question (blocked by guardrails)."""
    if state is None:
        return False
    now = datetime.utcnow()
    if state.cooldown_until and now < state.cooldown_until:
        return True
    if (state.questions_today or 0) >= MAX_QUESTIONS_PER_DAY:
        return True
    if state.last_question_at and (now - state.last_question_at) < MIN_GAP_BETWEEN_QUESTIONS:
        return True
    return False
