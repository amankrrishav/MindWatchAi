from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta

from app.db.session import get_db
from app.db.models import PHQ9Analysis, RiskAlert, RiskSnapshot, RiskTrendEvent

from app.services.phq9_scoring import calculate_phq9_score
from app.schemas.phq9 import PHQ9AnalysisRequest, PHQ9AnalysisResponse

from app.services.risk_engine import compute_risk_v2
from app.schemas.risk import RiskResponse

from app.services.timeline_service import build_user_timeline
from app.schemas.timeline import UserTimelineResponse

from app.services.alert_service import evaluate_and_create_alert
from app.schemas.alert import RiskAlertResponse

from app.services.behavior_feature_service import extract_behavior_features
from app.schemas.behavior import BehaviorFeatureResponse

from app.services.risk_snapshot_service import create_risk_snapshot
from app.schemas.risk_snapshot import RiskSnapshotResponse

from app.services.explanation_engine import build_explanation
from app.schemas.explanation import ExplanationResponse

from app.schemas.risk_trend import RiskTrendEventResponse

from app.services.monitoring_heartbeat import get_heartbeat

router = APIRouter()

# ===============================
# HEALTH
# ===============================

@router.get("/health")
def health_check():
    heartbeat = get_heartbeat()
    if heartbeat is None:
        return {
            "status": "starting",
            "worker_alive": False,
            "last_heartbeat": None,
        }

    stale = datetime.utcnow() - heartbeat > timedelta(minutes=6)
    return {
        "status": "ok" if not stale else "degraded",
        "worker_alive": not stale,
        "last_heartbeat": heartbeat.isoformat(),
    }

# ===============================
# PHQ-9
# ===============================

@router.post("/phq9/analyze", response_model=PHQ9AnalysisResponse)
def analyze_phq9(payload: PHQ9AnalysisRequest, db: Session = Depends(get_db)):
    result = calculate_phq9_score(payload.answers)

    record = PHQ9Analysis(
        user_id=payload.user_id,
        session_id=payload.session_id,
        total_score=result["total_score"],
        severity=result["severity"],
        suicide_risk=result["suicide_risk"]
    )

    db.add(record)
    db.commit()
    return result

# ===============================
# RISK
# ===============================

@router.get("/risk/{user_id}", response_model=RiskResponse)
def get_risk(user_id: str, db: Session = Depends(get_db)):
    result = compute_risk_v2(user_id, db)
    return {"user_id": user_id, **result}

# ===============================
# EXPLANATION
# ===============================

@router.get("/explanation/{user_id}", response_model=ExplanationResponse)
def get_explanation(user_id: str, db: Session = Depends(get_db)):
    risk = compute_risk_v2(user_id, db)
    explanation = build_explanation(
        risk_level=risk["risk_level"],
        confidence=risk["confidence"],
        reasons=risk["reasons"]
    )
    return {"user_id": user_id, **explanation}

# ===============================
# TIMELINE
# ===============================

@router.get("/timeline/{user_id}", response_model=UserTimelineResponse)
def get_user_timeline(user_id: str, db: Session = Depends(get_db)):
    timeline = build_user_timeline(user_id, db)
    return {"user_id": user_id, "timeline": timeline}

# ===============================
# ALERTS
# ===============================

@router.post("/alerts/evaluate/{user_id}", response_model=Optional[RiskAlertResponse])
def evaluate_alert(user_id: str, db: Session = Depends(get_db)):
    alert = evaluate_and_create_alert(user_id, db)
    if not alert:
        return None

    return {
        "id": alert.id,
        "user_id": alert.user_id,
        "risk_level": alert.risk_level,
        "confidence": alert.confidence,
        "reasons": alert.reasons.split(", ") if alert.reasons else [],
        "acknowledged": alert.acknowledged,
        "created_at": alert.created_at,
    }

@router.get("/alerts/{user_id}", response_model=List[RiskAlertResponse])
def get_user_alerts(user_id: str, db: Session = Depends(get_db)):
    alerts = (
        db.query(RiskAlert)
        .filter(RiskAlert.user_id == user_id, RiskAlert.acknowledged == False)
        .order_by(RiskAlert.created_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "risk_level": a.risk_level,
            "confidence": a.confidence,
            "reasons": a.reasons.split(", ") if a.reasons else [],
            "acknowledged": a.acknowledged,
            "created_at": a.created_at,
        }
        for a in alerts
    ]

# ===============================
# RISK SNAPSHOT (FIXED)
# ===============================

@router.get(
    "/risk/snapshots/{user_id}",
    response_model=List[RiskSnapshotResponse]
)
def get_risk_snapshots(user_id: str, db: Session = Depends(get_db)):
    snapshots = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .all()
    )

    result = []

    for s in snapshots:
        raw_reasons = s.reasons or []

        normalized_reasons: List[str] = []
        for r in raw_reasons:
            if isinstance(r, dict):
                normalized_reasons.append(
                    f"{r.get('factor')}: {r.get('impact')}"
                )
            else:
                normalized_reasons.append(str(r))

        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "risk_level": s.risk_level,
            "confidence": s.confidence,
            "reasons": normalized_reasons,
            "engine_version": s.engine_version,
            "created_at": s.created_at,
        })

    return result

# ===============================
# TRENDS
# ===============================

@router.get(
    "/trends/{user_id}",
    response_model=List[RiskTrendEventResponse]
)
def get_risk_trends(user_id: str, db: Session = Depends(get_db)):
    return (
        db.query(RiskTrendEvent)
        .filter(RiskTrendEvent.user_id == user_id)
        .order_by(RiskTrendEvent.created_at.desc())
        .all()
    )