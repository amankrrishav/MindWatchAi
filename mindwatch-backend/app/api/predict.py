from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List

from app.services.phq9_scoring import calculate_phq9_score
from app.schemas.phq9 import PHQ9AnalysisRequest, PHQ9AnalysisResponse
from app.db.models import PHQ9Analysis, RiskAlert
from app.db.session import get_db

from app.services.risk_engine import compute_risk_v1
from app.schemas.risk import RiskResponse

from app.services.timeline_service import build_user_timeline
from app.schemas.timeline import UserTimelineResponse

from app.services.alert_service import evaluate_and_create_alert
from app.schemas.alert import RiskAlertResponse

from app.services.behavior_feature_service import extract_behavior_features
from app.schemas.behavior import BehaviorFeatureResponse


router = APIRouter()


# -------------------------------
# Placeholder Prediction Endpoint
# -------------------------------

@router.get("/latest/{user_id}")
def latest_prediction(user_id: str):
    return {
        "user_id": user_id,
        "risk_score": 0.42,
        "explanation": {
            "reason": "placeholder model",
            "confidence": 0.42
        }
    }


# -------------------------------
# PHQ-9 Analysis Endpoint
# -------------------------------

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


# -------------------------------
# Risk Engine v1 Endpoint
# -------------------------------

@router.get("/risk/{user_id}", response_model=RiskResponse)
def get_risk(user_id: str, db: Session = Depends(get_db)):
    result = compute_risk_v1(user_id, db)

    return {
        "user_id": user_id,
        **result
    }


# -------------------------------
# User Timeline Endpoint
# -------------------------------

@router.get("/timeline/{user_id}", response_model=UserTimelineResponse)
def get_user_timeline(user_id: str, db: Session = Depends(get_db)):
    timeline = build_user_timeline(user_id, db)

    return {
        "user_id": user_id,
        "timeline": timeline
    }


# -------------------------------
# Risk Alert Evaluation (Manual/System)
# -------------------------------

@router.post(
    "/alerts/evaluate/{user_id}",
    response_model=Optional[RiskAlertResponse]
)
def evaluate_alert(user_id: str, db: Session = Depends(get_db)):
    alert = evaluate_and_create_alert(user_id, db)
    return alert


# -------------------------------
# Fetch User Alerts
# -------------------------------

@router.get(
    "/alerts/{user_id}",
    response_model=List[RiskAlertResponse]
)
def get_user_alerts(user_id: str, db: Session = Depends(get_db)):
    alerts = (
        db.query(RiskAlert)
        .filter(RiskAlert.user_id == user_id)
        .order_by(RiskAlert.created_at.desc())
        .all()
    )

    return alerts


# -------------------------------
# Behavior Feature Extraction Endpoint
# -------------------------------

@router.post(
    "/behavior/extract/{user_id}",
    response_model=Optional[BehaviorFeatureResponse]
)
def extract_behavior(user_id: str, db: Session = Depends(get_db)):
    feature = extract_behavior_features(user_id, db)
    return feature