from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.db.models import MonitoringState


# --------------------------------------------------
# Get or create persistent monitoring state
# --------------------------------------------------

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
            last_confidence=None,
            high_streak=0,
            cooldown_streak=0,
            trend_streak=0,
            last_trend=None,
            updated_at=datetime.utcnow(),
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    return state


# --------------------------------------------------
# Update monitoring state safely
# --------------------------------------------------

def update_state(
    state: MonitoringState,
    *,
    last_risk: str,
    last_confidence: float,
    high_streak: int,
    cooldown_streak: int,
    last_trend: Optional[str] = None,
    trend_streak: Optional[int] = None,
    db: Session,
):
    state.last_risk = last_risk
    state.last_confidence = last_confidence
    state.high_streak = high_streak
    state.cooldown_streak = cooldown_streak

    if last_trend is not None:
        state.last_trend = last_trend

    if trend_streak is not None:
        state.trend_streak = trend_streak

    state.updated_at = datetime.utcnow()
    db.commit()