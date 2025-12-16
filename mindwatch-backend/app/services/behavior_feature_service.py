from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import BehaviorEvent, BehaviorFeature


def extract_behavior_features(user_id: str, db: Session):
    """
    Deterministic behavior feature extraction (v1).
    """

    now = datetime.utcnow()

    events = (
        db.query(BehaviorEvent)
        .filter(BehaviorEvent.user_id == user_id)
        .all()
    )

    if not events:
        return None

    events_24h = [
        e for e in events
        if e.timestamp and e.timestamp >= now - timedelta(hours=24)
    ]

    events_7d = [
        e for e in events
        if e.timestamp and e.timestamp >= now - timedelta(days=7)
    ]

    negative_events = [
        e for e in events
        if e.features and e.features.get("sentiment", 0) < -0.3
    ]

    volatility_score = round(len(events_24h) / max(len(events_7d), 1), 2)

    feature = BehaviorFeature(
        user_id=user_id,
        event_count_24h=len(events_24h),
        event_count_7d=len(events_7d),
        negative_event_ratio=round(len(negative_events) / len(events), 2),
        volatility_score=volatility_score,
        last_event_at=max(e.timestamp for e in events if e.timestamp)
    )

    db.add(feature)
    db.commit()
    db.refresh(feature)

    return feature