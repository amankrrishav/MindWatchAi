from sqlalchemy.orm import Session
from app.db.models import RiskTrendEvent


def store_trend_event(
    user_id: str,
    direction: str,
    severity: str,
    reason: str,
    db: Session,
):
    event = RiskTrendEvent(
        user_id=user_id,
        direction=direction,
        severity=severity,
        reason=reason,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event