from sqlalchemy.orm import Session
from app.db.models import PHQ9Analysis
from app.services.risk_engine import compute_risk_v1


def build_user_timeline(user_id: str, db: Session):
    """
    Builds a chronological mental health timeline for a user.
    """

    analyses = (
        db.query(PHQ9Analysis)
        .filter(PHQ9Analysis.user_id == user_id)
        .order_by(PHQ9Analysis.created_at.asc())
        .all()
    )

    timeline = []

    for analysis in analyses:
        risk = compute_risk_v1(user_id, db)

        timeline.append({
            "timestamp": analysis.created_at,
            "source": "phq9",
            "severity": analysis.severity,
            "risk_level": risk["risk_level"],
            "confidence": risk["confidence"],
            "reasons": risk["reasons"]
        })

    return timeline