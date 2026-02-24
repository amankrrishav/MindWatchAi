"""
Risk Engine v3 – Wellness Score (0-100).

Combines:
  1. Latest WellnessCheckIn (7 signals)
  2. PHQ-9 severity (as a floor/anchor)
  3. Behaviour features (modifier)

Score interpretation:
  80-100  Thriving
  60-79   Good
  40-59   Moderate concern
  20-39   Elevated concern
  0-19    Crisis / high-risk

Higher score = healthier / lower risk.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.models import WellnessCheckIn, PHQ9Analysis, BehaviorFeature
from app.services.behavior_feature_service import extract_behavior_features


def compute_wellness_score(
    mood: int,
    sleep_quality: int,
    energy: int,
    anxiety: int,
    social: int,
    focus: int,
    appetite: int,
) -> float:
    """Pure function: convert 7 signals (each 1-5) → wellness score 0-100."""
    # Positive signals (high = good)
    positive = (mood + sleep_quality + energy + social + focus + appetite) / 6
    # Negative signal (high = bad) → invert
    negative_inverted = (6 - anxiety)

    # Blend: 70% positive signals, 30% inverted anxiety
    raw = (positive * 0.70 + negative_inverted * 0.30)
    # Map 1-5 scale → 0-100
    return round((raw - 1) / 4 * 100, 1)


def compute_risk_v3(user_id: str, db: Session) -> dict:
    """
    v3 risk assessment.
    Returns wellness_score (0-100) + risk_level + reasons.
    """
    # --- 1. Latest check-in ---
    checkin = (
        db.query(WellnessCheckIn)
        .filter(WellnessCheckIn.user_id == user_id)
        .order_by(WellnessCheckIn.created_at.desc())
        .first()
    )

    if not checkin:
        # Fall back to PHQ-9 anchoring
        return _from_phq9_only(user_id, db)

    base_score = checkin.wellness_score
    reasons: list[dict] = []

    # --- 2. PHQ-9 anchor (if present) ---
    phq9 = (
        db.query(PHQ9Analysis)
        .filter(PHQ9Analysis.user_id == user_id)
        .order_by(PHQ9Analysis.created_at.desc())
        .first()
    )

    phq9_floor_map = {
        "minimal": None,          # no floor
        "mild": 40.0,
        "moderate": 25.0,
        "moderately_severe": 15.0,
        "severe": 5.0,
    }

    if phq9:
        floor = phq9_floor_map.get(phq9.severity)
        if floor is not None and base_score > floor:
            # Clinical severity anchors the ceiling
            base_score = min(base_score, floor + 20)
            reasons.append({"factor": "phq9_clinical_anchor", "impact": f"phq9_{phq9.severity}"})
        if phq9.suicide_risk and base_score > 10:
            base_score = min(base_score, 10)
            reasons.append({"factor": "suicide_risk_flag", "impact": "critical_floor"})

    # --- 3. Signal breakdown ---
    def signal_reason(name: str, value: int, inverted: bool = False):
        effective = (6 - value) if inverted else value
        if effective <= 2:
            reasons.append({"factor": name, "impact": "low"})
        elif effective >= 5:
            reasons.append({"factor": name, "impact": "high"})

    signal_reason("mood", checkin.mood)
    signal_reason("sleep_quality", checkin.sleep_quality)
    signal_reason("energy", checkin.energy)
    signal_reason("anxiety", checkin.anxiety, inverted=True)
    signal_reason("social", checkin.social)
    signal_reason("focus", checkin.focus)
    signal_reason("appetite", checkin.appetite)

    # --- 4. Behaviour modifier ---
    behavior = (
        db.query(BehaviorFeature)
        .filter(BehaviorFeature.user_id == user_id)
        .order_by(BehaviorFeature.created_at.desc())
        .first()
    )
    if not behavior:
        behavior = extract_behavior_features(user_id, db)

    if behavior:
        if behavior.negative_event_ratio >= 0.7:
            base_score = max(0, base_score - 10)
            reasons.append({"factor": "high_negative_behavior", "impact": "lowered_score"})
        elif behavior.negative_event_ratio < 0.2 and behavior.volatility_score < 0.3:
            base_score = min(100, base_score + 5)
            reasons.append({"factor": "stable_positive_behavior", "impact": "raised_score"})

    final_score = round(max(0, min(100, base_score)), 1)
    risk_level = _score_to_risk_level(final_score)

    return {
        "wellness_score": final_score,
        "risk_level": risk_level,
        "confidence": round(1 - (final_score / 100) if risk_level != "unknown" else 0, 2),
        "reasons": reasons,
        "signals": {
            "mood": checkin.mood,
            "sleep_quality": checkin.sleep_quality,
            "energy": checkin.energy,
            "anxiety": checkin.anxiety,
            "social": checkin.social,
            "focus": checkin.focus,
            "appetite": checkin.appetite,
        },
    }


def _from_phq9_only(user_id: str, db: Session) -> dict:
    phq9 = (
        db.query(PHQ9Analysis)
        .filter(PHQ9Analysis.user_id == user_id)
        .order_by(PHQ9Analysis.created_at.desc())
        .first()
    )
    if not phq9:
        return {
            "wellness_score": None,
            "risk_level": "unknown",
            "confidence": 0.0,
            "reasons": [{"factor": "no_data", "impact": "no_checkin_or_phq9"}],
            "signals": None,
        }
    phq9_score_map = {
        "minimal": 80.0,
        "mild": 55.0,
        "moderate": 35.0,
        "moderately_severe": 20.0,
        "severe": 8.0,
    }
    score = phq9_score_map.get(phq9.severity, 50.0)
    if phq9.suicide_risk:
        score = min(score, 10)
    return {
        "wellness_score": round(score, 1),
        "risk_level": _score_to_risk_level(score),
        "confidence": round(1 - score / 100, 2),
        "reasons": [{"factor": "phq9_anchor", "impact": f"phq9_{phq9.severity}"}],
        "signals": None,
    }


def _score_to_risk_level(score: float) -> str:
    if score >= 80:
        return "low"
    if score >= 60:
        return "low"
    if score >= 40:
        return "medium"
    if score >= 20:
        return "high"
    return "high"
