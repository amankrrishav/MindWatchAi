from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models import MonitoringState


def get_or_create_state(user_id: str, db: Session) -> MonitoringState:
    state = (
        db.query(MonitoringState)
        .filter(MonitoringState.user_id == user_id)
        .first()
    )

    if not state:
        state = MonitoringState(
            user_id=user_id,
            last_risk=None,
            high_streak=0,
            cooldown_streak=0,
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    return state


def update_state(
    state: MonitoringState,
    *,
    last_risk: str,
    high_streak: int,
    cooldown_streak: int,
    db: Session
):
    state.last_risk = last_risk
    state.high_streak = high_streak
    state.cooldown_streak = cooldown_streak
    state.updated_at = datetime.utcnow()

    db.commit()