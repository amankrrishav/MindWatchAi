"""Build user timeline from PHQ-9 analyses. Uses severity as risk proxy per analysis."""
from sqlalchemy.orm import Session

from app.db.models import PHQ9Analysis

SEVERITY_TO_RISK = {
    "minimal": "low",
    "mild": "low",
    "moderate": "medium",
    "moderately_severe": "high",
    "severe": "high",
}


def build_user_timeline(user_id: str, db: Session) -> list[dict]:
    analyses = (
        db.query(PHQ9Analysis)
        .filter(PHQ9Analysis.user_id == user_id)
        .order_by(PHQ9Analysis.created_at.asc())
        .all()
    )
    timeline = []
    for a in analyses:
        risk_level = SEVERITY_TO_RISK.get(a.severity, "medium")
        confidence = 0.3 + (a.total_score / 27) * 0.7
        timeline.append({
            "timestamp": a.created_at,
            "source": "phq9",
            "severity": a.severity,
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "reasons": [f"phq9_{a.severity}"],
        })
    return timeline
