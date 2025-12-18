from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models import RiskSnapshot
from app.services.risk_engine import compute_risk_v2

MIN_CONFIDENCE_DELTA = 0.1


def create_risk_snapshot(user_id: str, db: Session):
    risk = compute_risk_v2(user_id, db)

    # Get last snapshot
    last_snapshot = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .first()
    )

    # -------------------------------
    # 🔇 Noise reduction logic
    # -------------------------------
    if last_snapshot:
        same_level = last_snapshot.risk_level == risk["risk_level"]
        confidence_delta = abs(
            last_snapshot.confidence - risk["confidence"]
        )

        if same_level and confidence_delta < MIN_CONFIDENCE_DELTA:
            return None

    snapshot = RiskSnapshot(
        user_id=user_id,
        risk_level=risk["risk_level"],
        confidence=risk["confidence"],
        reasons=risk["reasons"],
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return snapshot