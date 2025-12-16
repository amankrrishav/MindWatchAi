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

#Risk Engine v2
from app.db.models import BehaviorFeature


def compute_risk_v2(user_id: str, db):
    """
    Risk Engine v2
    Extends v1 using behavior features.
    """

    # ---- Start with v1 risk ----
    base = compute_risk_v1(user_id, db)

    score = base["confidence"]
    reasons = list(base["reasons"])

    # ---- Fetch latest behavior features ----
    behavior = (
        db.query(BehaviorFeature)
        .filter(BehaviorFeature.user_id == user_id)
        .order_by(BehaviorFeature.created_at.desc())
        .first()
    )

    if not behavior:
        return {
            "risk_level": base["risk_level"],
            "confidence": score,
            "reasons": reasons + ["no_behavior_features"]
        }

    # ---- Behavior-based adjustments ----

    # High negativity → amplify risk
    if behavior.negative_event_ratio >= 0.7:
        score += 0.2
        reasons.append("high_negative_behavior")

    # High volatility → amplify risk
    if behavior.volatility_score >= 0.8:
        score += 0.1
        reasons.append("behavior_volatility")

    # Sustained activity → further signal
    if behavior.event_count_24h >= 3:
        score += 0.05
        reasons.append("activity_spike")

    # ---- Risk Decay / Recovery Logic ----

    # Do NOT decay if suicide risk is present
    if "suicide_risk_flag" not in reasons:

        # Behavior has stabilized → allow recovery
        if behavior:
            stable_behavior = (
                behavior.negative_event_ratio < 0.3 and
                behavior.volatility_score < 0.4 and
                behavior.event_count_24h <= 1
            )

            if stable_behavior:
                score -= 0.2
                reasons.append("risk_recovery_stable_behavior")

                
    # ---- Clamp score ----
    score = min(score, 1.0)

    # ---- Risk buckets (same thresholds) ----
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