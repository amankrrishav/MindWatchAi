"""
Behavior feature extraction. Called on ingest and lazily in risk engine.
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import BehaviorEvent, BehaviorFeature


def extract_behavior_features(user_id: str, db: Session) -> Optional[BehaviorFeature]:
    """Extract and store behavior features for a user. Returns feature or None if no events."""
    now = datetime.utcnow()

    cutoff = now - timedelta(days=7)
    events = (
        db.query(BehaviorEvent)
        .filter(
            BehaviorEvent.user_id == user_id,
            BehaviorEvent.timestamp >= cutoff
        )
        .all()
    )

    if not events:
        return None

    events_24h = [e for e in events if e.timestamp and (now - e.timestamp) <= timedelta(hours=24)]
    events_7d = [e for e in events if e.timestamp and (now - e.timestamp) <= timedelta(days=7)]
    negative_events = [
        e for e in events
        if e.features and e.features.get("sentiment", 0) < -0.3
    ]

    volatility_score = round(len(events_24h) / max(len(events_7d), 1), 2)
    negative_ratio = round(len(negative_events) / len(events), 2)

    feature = BehaviorFeature(
        user_id=user_id,
        event_count_24h=len(events_24h),
        event_count_7d=len(events_7d),
        negative_event_ratio=negative_ratio,
        volatility_score=volatility_score,
        last_event_at=max((e.timestamp for e in events if e.timestamp), default=None),
    )

    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature
