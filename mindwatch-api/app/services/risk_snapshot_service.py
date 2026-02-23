from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import RiskSnapshot
from app.services.risk_engine import compute_risk_v2

CONFIDENCE_EPSILON = 0.05


def create_risk_snapshot(user_id: str, db: Session) -> Optional[RiskSnapshot]:
    """Create snapshot only when meaningful change. Returns snapshot or None if skipped."""
    risk = compute_risk_v2(user_id, db)

    last = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .first()
    )

    if last:
        same_risk = last.risk_level == risk["risk_level"]
        small_delta = abs(last.confidence - risk["confidence"]) < CONFIDENCE_EPSILON
        if same_risk and small_delta:
            return last

    snapshot = RiskSnapshot(
        user_id=user_id,
        risk_level=risk["risk_level"],
        confidence=risk["confidence"],
        reasons=risk["reasons"],
        engine_version="v2",
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot
