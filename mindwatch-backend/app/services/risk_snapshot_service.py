from sqlalchemy.orm import Session

from app.db.models import RiskSnapshot
from app.services.risk_engine import compute_risk_v2


CONFIDENCE_EPSILON = 0.05


def create_risk_snapshot(user_id: str, db: Session):
    """
    Create a risk snapshot only when a meaningful change occurs.
    """

    # Compute current risk
    risk = compute_risk_v2(user_id, db)

    # Fetch last snapshot
    last = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .first()
    )

    # -------------------------------
    # De-duplication rule (authoritative)
    # -------------------------------
    if last:
        same_risk = last.risk_level == risk["risk_level"]
        small_delta = abs(last.confidence - risk["confidence"]) < CONFIDENCE_EPSILON
        same_engine = last.engine_version == "v2"

        if same_risk and small_delta and same_engine:
            print(f"[Snapshot] Skipped duplicate snapshot for {user_id}")
            return last

    # -------------------------------
    # Store meaningful snapshot
    # -------------------------------
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

    print(f"[Snapshot] Stored snapshot for {user_id}")
    return snapshot