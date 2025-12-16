from sqlalchemy.orm import Session
from app.db.models import RiskSnapshot
from app.services.risk_engine import compute_risk_v2


def create_risk_snapshot(user_id: str, db: Session):
    """
    Computes risk (v2) and stores a snapshot.
    """

    risk = compute_risk_v2(user_id, db)

    snapshot = RiskSnapshot(
        user_id=user_id,
        risk_level=risk["risk_level"],
        confidence=risk["confidence"],
        reasons=risk["reasons"],
        engine_version="v2"
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return snapshot