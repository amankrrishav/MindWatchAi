from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import RiskTrendEvent
from app.config import get_settings


def store_trend_event(
    user_id: str,
    direction: str,
    severity: str,
    reason: str,
    db: Session,
) -> Optional[RiskTrendEvent]:
    """Store trend event with deduplication."""
    since = datetime.utcnow() - timedelta(hours=get_settings().trend_dedup_hours)
    existing = (
        db.query(RiskTrendEvent)
        .filter(
            RiskTrendEvent.user_id == user_id,
            RiskTrendEvent.direction == direction,
            RiskTrendEvent.severity == severity,
            RiskTrendEvent.created_at >= since,
        )
        .first()
    )
    if existing:
        return existing

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
