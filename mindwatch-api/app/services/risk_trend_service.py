from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.db.models import RiskSnapshot

RISK_ORDER = {"unknown": 0, "low": 1, "medium": 2, "high": 3}


def detect_risk_trend(
    user_id: str,
    db: Session,
    lookback_hours: int = 24,
    min_confidence_jump: float = 0.25,
) -> dict:
    """Detect accelerating or recovering risk. Does NOT trigger alerts."""
    since = datetime.utcnow() - timedelta(hours=lookback_hours)
    snapshots = (
        db.query(RiskSnapshot)
        .filter(
            RiskSnapshot.user_id == user_id,
            RiskSnapshot.created_at >= since,
        )
        .order_by(RiskSnapshot.created_at.asc())
        .all()
    )

    if len(snapshots) < 2:
        return {"trend_detected": False, "direction": "stable", "severity": "normal", "reason": None}

    first, last = snapshots[0], snapshots[-1]
    confidence_delta = last.confidence - first.confidence

    if confidence_delta >= min_confidence_jump:
        return {
            "trend_detected": True,
            "direction": "up",
            "severity": "accelerating",
            "reason": f"Risk confidence increased ({first.confidence:.2f} → {last.confidence:.2f})",
        }
    if confidence_delta <= -min_confidence_jump:
        return {
            "trend_detected": True,
            "direction": "down",
            "severity": "recovering",
            "reason": f"Risk confidence decreased ({first.confidence:.2f} → {last.confidence:.2f})",
        }

    recent = snapshots[-3:] if len(snapshots) >= 3 else snapshots
    for prev, curr in zip(recent, recent[1:]):
        prev_level = RISK_ORDER.get(prev.risk_level, 0)
        curr_level = RISK_ORDER.get(curr.risk_level, 0)
        if curr_level > prev_level:
            return {
                "trend_detected": True,
                "direction": "up",
                "severity": "accelerating",
                "reason": f"Risk level increased ({prev.risk_level} → {curr.risk_level})",
            }
        if curr_level < prev_level:
            return {
                "trend_detected": True,
                "direction": "down",
                "severity": "recovering",
                "reason": f"Risk level decreased ({prev.risk_level} → {curr.risk_level})",
            }

    return {"trend_detected": False, "direction": "stable", "severity": "normal", "reason": None}
