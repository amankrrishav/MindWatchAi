"""Predict endpoints: risk, alerts, snapshots, trends, explanation, timeline."""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import PHQ9Analysis, RiskAlert, RiskSnapshot, RiskTrendEvent
from app.services.phq9_scoring import calculate_phq9_score
from app.services.risk_engine import compute_risk_v2
from app.services.timeline_service import build_user_timeline
from app.services.alert_service import evaluate_and_create_alert
from app.services.explanation_engine import build_explanation
from app.services.monitoring_heartbeat import get_heartbeat

from app.schemas.phq9 import PHQ9AnalysisRequest, PHQ9AnalysisResponse
from app.schemas.risk import RiskResponse
from app.schemas.timeline import UserTimelineResponse
from app.schemas.alert import RiskAlertResponse
from app.schemas.risk_snapshot import RiskSnapshotResponse
from app.schemas.risk_trend import RiskTrendEventResponse
from app.schemas.explanation import ExplanationResponse
from app.auth.context import get_current_user_id
from app.services.risk_engine_v3 import compute_risk_v3

router = APIRouter(prefix="/predict", tags=["predict"])


@router.get("/health")
def health_check():
    """System health: worker liveness, last heartbeat."""
    heartbeat = get_heartbeat()
    if heartbeat is None:
        return {"status": "starting", "worker_alive": False, "last_heartbeat": None}
    stale = datetime.utcnow() - heartbeat > timedelta(minutes=6)
    return {
        "status": "ok" if not stale else "degraded",
        "worker_alive": not stale,
        "last_heartbeat": heartbeat.isoformat(),
    }


@router.post("/phq9/analyze", response_model=PHQ9AnalysisResponse)
def analyze_phq9(payload: PHQ9AnalysisRequest, db: Session = Depends(get_db)):
    result = calculate_phq9_score(payload.answers)
    record = PHQ9Analysis(
        user_id=payload.user_id,
        session_id=payload.session_id,
        total_score=result["total_score"],
        severity=result["severity"],
        suicide_risk=result["suicide_risk"],
    )
    db.add(record)
    db.commit()
    return result


@router.get("/risk/{user_id}", response_model=RiskResponse)
def get_risk(user_id: str, db: Session = Depends(get_db)):
    result = compute_risk_v2(user_id, db)
    return {"user_id": user_id, **result}


@router.get("/explanation/{user_id}", response_model=ExplanationResponse)
def get_explanation(user_id: str, db: Session = Depends(get_db)):
    risk = compute_risk_v2(user_id, db)
    explanation = build_explanation(
        risk_level=risk["risk_level"],
        confidence=risk["confidence"],
        reasons=risk["reasons"],
    )
    return {"user_id": user_id, **explanation}


@router.get("/timeline/{user_id}", response_model=UserTimelineResponse)
def get_user_timeline(user_id: str, db: Session = Depends(get_db)):
    timeline = build_user_timeline(user_id, db)
    return {"user_id": user_id, "timeline": timeline}


@router.post("/alerts/evaluate/{user_id}", response_model=Optional[RiskAlertResponse])
def evaluate_alert(user_id: str, db: Session = Depends(get_db)):
    alert = evaluate_and_create_alert(user_id, db)
    if not alert:
        return None
    return _alert_to_response(alert)


@router.get("/alerts/{user_id}", response_model=list[RiskAlertResponse])
def get_user_alerts(user_id: str, db: Session = Depends(get_db)):
    alerts = (
        db.query(RiskAlert)
        .filter(RiskAlert.user_id == user_id, RiskAlert.acknowledged.is_(False))
        .order_by(RiskAlert.created_at.desc())
        .all()
    )
    return [_alert_to_response(a) for a in alerts]


@router.patch("/alerts/{alert_id}/acknowledge", response_model=RiskAlertResponse)
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(RiskAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    db.commit()
    db.refresh(alert)
    return _alert_to_response(alert)


@router.patch("/alerts/{alert_id}/resolve", response_model=RiskAlertResponse)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(RiskAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return _alert_to_response(alert)


def _alert_to_response(alert: RiskAlert) -> dict:
    reasons = alert.reasons.split(", ") if alert.reasons else []
    return {
        "id": alert.id,
        "user_id": alert.user_id,
        "risk_level": alert.risk_level,
        "confidence": alert.confidence,
        "reasons": reasons,
        "acknowledged": alert.acknowledged,
        "created_at": alert.created_at,
    }


@router.get("/risk/snapshots/{user_id}", response_model=list[RiskSnapshotResponse])
def get_risk_snapshots(user_id: str, db: Session = Depends(get_db)):
    snapshots = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .all()
    )
    result = []
    for s in snapshots:
        raw = s.reasons or []
        normalized = []
        for r in raw:
            if isinstance(r, dict):
                normalized.append(f"{r.get('factor', '')}: {r.get('impact', '')}")
            else:
                normalized.append(str(r))
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "risk_level": s.risk_level,
            "confidence": s.confidence,
            "reasons": normalized,
            "engine_version": s.engine_version or "v2",
            "created_at": s.created_at,
        })
    return result


@router.get("/trends/{user_id}", response_model=list[RiskTrendEventResponse])
def get_risk_trends(user_id: str, db: Session = Depends(get_db)):
    return (
        db.query(RiskTrendEvent)
        .filter(RiskTrendEvent.user_id == user_id)
        .order_by(RiskTrendEvent.created_at.desc())
        .all()
    )


# ---------------------------------------------------------------------------
# /me endpoints – JWT-authenticated, no user_id in URL
# ---------------------------------------------------------------------------


@router.get("/risk/me")
def get_risk_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """v3 wellness risk for the authenticated user."""
    from app.services.risk_engine_v3 import compute_risk_v3
    result = compute_risk_v3(user_id, db)
    return {"user_id": user_id, **result}


@router.get("/risk/snapshots/me", response_model=list[RiskSnapshotResponse])
def get_risk_snapshots_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    snapshots = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .all()
    )
    result = []
    for s in snapshots:
        raw = s.reasons or []
        normalized = []
        for r in raw:
            if isinstance(r, dict):
                normalized.append(f"{r.get('factor', '')}: {r.get('impact', '')}")
            else:
                normalized.append(str(r))
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "risk_level": s.risk_level,
            "confidence": s.confidence,
            "reasons": normalized,
            "engine_version": s.engine_version or "v2",
            "created_at": s.created_at,
        })
    return result


@router.get("/alerts/me", response_model=list[RiskAlertResponse])
def get_alerts_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    alerts = (
        db.query(RiskAlert)
        .filter(RiskAlert.user_id == user_id, RiskAlert.acknowledged.is_(False))
        .order_by(RiskAlert.created_at.desc())
        .all()
    )
    return [_alert_to_response(a) for a in alerts]


@router.get("/trends/me", response_model=list[RiskTrendEventResponse])
def get_trends_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return (
        db.query(RiskTrendEvent)
        .filter(RiskTrendEvent.user_id == user_id)
        .order_by(RiskTrendEvent.created_at.desc())
        .all()
    )
