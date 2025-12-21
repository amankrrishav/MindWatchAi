
from datetime import datetime
from app.guardrails.constants import *

def guardrails_blocked(state) -> bool:
    now = datetime.utcnow()

    if state is None:
        return False

    if state.cooldown_until and now < state.cooldown_until:
        return True

    if state.questions_today >= MAX_QUESTIONS_PER_DAY:
        return True

    if state.last_question_at and (now - state.last_question_at) < MIN_GAP_BETWEEN_QUESTIONS:
        return True

    return False