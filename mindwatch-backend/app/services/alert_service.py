from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.db.models import RiskAlert
from app.services.risk_engine import compute_risk_v2


DEDUP_WINDOW_HOURS = 24


def evaluate_and_create_alert(user_id: str, db: Session):
    """
    Creates a risk alert ONLY if:
    - Risk is HIGH
    - No unacknowledged HIGH alert already exists
    - No similar alert exists within the deduplication window
    """

    # -------------------------------
    # Compute current risk
    # -------------------------------
    risk = compute_risk_v2(user_id, db)

    # Only alert on HIGH risk
    if risk["risk_level"] != "high":
        return None

    # -------------------------------
    # 🔒 Phase 13.1.3 — Core guard
    # Prevent multiple active HIGH alerts
    # -------------------------------
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

    # -------------------------------
    # Deduplication window (24h)
    # -------------------------------
    now = datetime.utcnow()
    window_start = now - timedelta(hours=DEDUP_WINDOW_HOURS)

    recent_alert = (
        db.query(RiskAlert)
        .filter(
            RiskAlert.user_id == user_id,
            RiskAlert.risk_level == "high",
            RiskAlert.acknowledged.is_(False),
            RiskAlert.created_at >= window_start,
        )
        .first()
    )

    if recent_alert:
        return None

    # -------------------------------
    # Create new alert
    # -------------------------------
    alert = RiskAlert(
        user_id=user_id,
        risk_level="high",
        confidence=risk["confidence"],        # float (0–1)
        reasons=", ".join(risk["reasons"]),   # stored as string
        acknowledged=False,
        created_at=now,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert