from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import RiskAlert
from app.services.risk_engine import compute_risk_v2
from app.notifications.factory import create_notification_intent

DEDUP_WINDOW_HOURS = 24


def evaluate_and_create_alert(user_id: str, db: Session) -> Optional[RiskAlert]:
    """Create HIGH risk alert only if conditions are met."""
    risk = compute_risk_v2(user_id, db)
    if risk["risk_level"] != "high":
        return None

    existing = (
        db.query(RiskAlert)
        .filter(
            RiskAlert.user_id == user_id,
            RiskAlert.risk_level == "high",
            RiskAlert.acknowledged.is_(False),
        )
        .first()
    )
    if existing:
        return None

    now = datetime.utcnow()
    window_start = now - timedelta(hours=DEDUP_WINDOW_HOURS)
    recent = (
        db.query(RiskAlert)
        .filter(
            RiskAlert.user_id == user_id,
            RiskAlert.risk_level == "high",
            RiskAlert.created_at >= window_start,
        )
        .first()
    )
    if recent:
        return None

    alert = RiskAlert(
        user_id=user_id,
        risk_level="high",
        confidence=risk["confidence"],
        reasons=", ".join(risk["reasons"]),
        acknowledged=False,
    )
    db.add(alert)
    db.flush()  # get alert.id if needed

    create_notification_intent(
        db=db,
        user_id=user_id,
        intent_type="risk_alert",
        priority="high",
        reason=f"High risk detected. Factors: {', '.join(risk['reasons'][:3])}.",
        source="monitoring_worker",
        silent_allowed=False,
    )

    db.commit()
    db.refresh(alert)
    return alert
