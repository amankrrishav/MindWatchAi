from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.db.models import RiskSnapshot
from app.services.risk_engine import compute_risk_v2


CONFIDENCE_EPSILON = 0.05
MIN_SNAPSHOT_INTERVAL_MINUTES = 10


def create_risk_snapshot(user_id: str, db: Session):
    """
    Create a risk snapshot with noise reduction.
    """

    # Compute current risk
    risk = compute_risk_v2(user_id, db)
    current_level = risk["risk_level"]
    current_confidence = risk["confidence"]
    reasons = risk["reasons"]

    # Fetch last snapshot
    last_snapshot = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .first()
    )

    # -------------------------------
    # Rule 1 — Deduplicate identical state
    # -------------------------------
    if last_snapshot:
        same_level = last_snapshot.risk_level == current_level
        confidence_delta = abs(
            last_snapshot.confidence - current_confidence
        )

        if same_level and confidence_delta < CONFIDENCE_EPSILON:
            print(
                f"[Snapshot] Skipped duplicate snapshot for {user_id}"
            )
            return None

        # -------------------------------
        # Rule 2 — Time-based compression
        # -------------------------------
        time_since_last = (
            datetime.utcnow() - last_snapshot.created_at
        )

        if (
            same_level
            and time_since_last
            < timedelta(minutes=MIN_SNAPSHOT_INTERVAL_MINUTES)
        ):
            print(
                f"[Snapshot] Skipped time-compressed snapshot for {user_id}"
            )
            return None

    # -------------------------------
    # Rule 3 — Store meaningful snapshot
    # -------------------------------
    snapshot = RiskSnapshot(
        user_id=user_id,
        risk_level=current_level,
        confidence=current_confidence,
        reasons=reasons,
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    print(
        f"[Snapshot] Stored snapshot for {user_id}: "
        f"{current_level} ({current_confidence:.2f})"
    )

    return snapshot