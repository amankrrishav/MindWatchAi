from sqlalchemy.orm import Session
from app.db.models import RiskAlert
from app.services.risk_engine import compute_risk_v1


def evaluate_and_create_alert(user_id: str, db: Session):
    """
    Evaluates risk and creates alert if escalation rules are met.
    """

    risk = compute_risk_v1(user_id, db)

    if risk["risk_level"] != "high":
        return None

    alert = RiskAlert(
        user_id=user_id,
        risk_level=risk["risk_level"],
        confidence=int(risk["confidence"] * 100),
        reason=", ".join(risk["reasons"])
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert