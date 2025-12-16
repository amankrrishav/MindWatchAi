from sqlalchemy.orm import Session
from app.db.models import PHQ9Analysis, BehaviorEvent


def compute_risk_v1(user_id: str, db: Session):
    """
    Deterministic Risk Engine v1
    Rules-based, auditable, no ML.
    """

    latest_phq9 = (
        db.query(PHQ9Analysis)
        .filter(PHQ9Analysis.user_id == user_id)
        .order_by(PHQ9Analysis.created_at.desc())
        .first()
    )

    if not latest_phq9:
        return {
            "risk_level": "unknown",
            "confidence": 0.0,
            "reasons": ["no_phq9_data"]
        }

    reasons = []
    score = 0.0

    # ---- PHQ-9 severity rules ----
    severity_map = {
        "minimal": 0.1,
        "mild": 0.4,
        "moderate": 0.6,
        "moderately_severe": 0.8,
        "severe": 1.0
    }

    score += severity_map.get(latest_phq9.severity, 0)
    reasons.append(f"phq9_{latest_phq9.severity}")

    # ---- Suicide risk rule (Q9) ----
    if latest_phq9.suicide_risk:
        score = max(score, 0.75)
        reasons.append("suicide_risk_flag")

    # ---- Behavior signal (optional, additive) ----
    behavior_count = (
        db.query(BehaviorEvent)
        .filter(BehaviorEvent.user_id == user_id)
        .count()
    )

    if behavior_count >= 5:
        score += 0.1
        reasons.append("behavior_pattern_detected")

    # ---- Clamp score ----
    score = min(score, 1.0)

    # ---- Risk buckets ----
    if score < 0.3:
        risk_level = "low"
    elif score < 0.7:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "risk_level": risk_level,
        "confidence": round(score, 2),
        "reasons": reasons
    }