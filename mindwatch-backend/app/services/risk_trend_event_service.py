from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import RiskTrendEvent

TREND_DEDUP_HOURS = 6


def store_trend_event(
    user_id: str,
    direction: str,
    severity: str,
    reason: str,
    db: Session,
):
    since = datetime.utcnow() - timedelta(hours=TREND_DEDUP_HOURS)

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
        print(f"[Trend] Skipped duplicate trend for {user_id}")
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

    print(f"[Trend] Stored trend event for {user_id}")
    return event