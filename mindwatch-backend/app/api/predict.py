from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.db.session import get_db
from app.db.models import PHQ9Analysis, RiskAlert, RiskSnapshot

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


router = APIRouter()


# ===============================
# PHQ-9 ANALYSIS
# ===============================

@router.post("/phq9/analyze", response_model=PHQ9AnalysisResponse)
def analyze_phq9(
    payload: PHQ9AnalysisRequest,
    db: Session = Depends(get_db)
):
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
# RISK ENGINE v2
# ===============================

@router.get("/risk/{user_id}", response_model=RiskResponse)
def get_risk(user_id: str, db: Session = Depends(get_db)):
    result = compute_risk_v2(user_id, db)
    return {"user_id": user_id, **result}

# -------------------------------
# Clinician Explanation Endpoint
# -------------------------------

@router.get(
    "/explanation/{user_id}",
    response_model=ExplanationResponse
)
def get_explanation(user_id: str, db: Session = Depends(get_db)):
    risk = compute_risk_v2(user_id, db)

    explanation = build_explanation(
        risk_level=risk["risk_level"],
        confidence=risk["confidence"],
        reasons=risk["reasons"]
    )

    return {
        "user_id": user_id,
        **explanation
    }


# ===============================
# USER TIMELINE
# ===============================

@router.get("/timeline/{user_id}", response_model=UserTimelineResponse)
def get_user_timeline(user_id: str, db: Session = Depends(get_db)):
    timeline = build_user_timeline(user_id, db)
    return {"user_id": user_id, "timeline": timeline}


# ===============================
# ALERT EVALUATION (CREATE)
# ===============================

@router.post(
    "/alerts/evaluate/{user_id}",
    response_model=Optional[RiskAlertResponse]
)
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


# ===============================
# ALERT FETCH (ACTIVE ONLY)
# ===============================

@router.get(
    "/alerts/{user_id}",
    response_model=List[RiskAlertResponse]
)
def get_user_alerts(user_id: str, db: Session = Depends(get_db)):
    alerts = (
        db.query(RiskAlert)
        .filter(
            RiskAlert.user_id == user_id,
            RiskAlert.acknowledged == False
        )
        .order_by(RiskAlert.created_at.desc())
        .all()
    )

    return [
        {
            "id": alert.id,
            "user_id": alert.user_id,
            "risk_level": alert.risk_level,
            "confidence": alert.confidence,
            "reasons": alert.reasons.split(", ") if alert.reasons else [],
            "acknowledged": alert.acknowledged,
            "created_at": alert.created_at,
        }
        for alert in alerts
    ]


# ===============================
# ALERT ACTIONS (PHASE 9.1)
# ===============================

@router.patch(
    "/alerts/{alert_id}/acknowledge",
    response_model=RiskAlertResponse
)
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if not alert.acknowledged:
        alert.acknowledged = True
        db.commit()
        db.refresh(alert)

    return {
        "id": alert.id,
        "user_id": alert.user_id,
        "risk_level": alert.risk_level,
        "confidence": alert.confidence,
        "reasons": alert.reasons.split(", ") if alert.reasons else [],
        "acknowledged": alert.acknowledged,
        "created_at": alert.created_at,
    }


@router.patch(
    "/alerts/{alert_id}/resolve",
    response_model=RiskAlertResponse
)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if not alert.resolved_at:
        alert.acknowledged = True
        alert.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)

    return {
        "id": alert.id,
        "user_id": alert.user_id,
        "risk_level": alert.risk_level,
        "confidence": alert.confidence,
        "reasons": alert.reasons.split(", ") if alert.reasons else [],
        "acknowledged": alert.acknowledged,
        "created_at": alert.created_at,
    }


# ===============================
# BEHAVIOR FEATURES
# ===============================

@router.post(
    "/behavior/extract/{user_id}",
    response_model=Optional[BehaviorFeatureResponse]
)
def extract_behavior(user_id: str, db: Session = Depends(get_db)):
    return extract_behavior_features(user_id, db)


# ===============================
# RISK SNAPSHOT
# ===============================

@router.post(
    "/risk/snapshot/{user_id}",
    response_model=RiskSnapshotResponse
)
def snapshot_risk(user_id: str, db: Session = Depends(get_db)):
    return create_risk_snapshot(user_id, db)


# ===============================
# RISK HISTORY
# ===============================

@router.get(
    "/risk/snapshots/{user_id}",
    response_model=List[RiskSnapshotResponse]
)
def get_risk_snapshots(user_id: str, db: Session = Depends(get_db)):
    return (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.user_id == user_id)
        .order_by(RiskSnapshot.created_at.desc())
        .all()
    )