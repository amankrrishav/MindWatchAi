from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.phq9_scoring import calculate_phq9_score
from app.schemas.phq9 import PHQ9AnalysisRequest, PHQ9AnalysisResponse
from app.db.models import PHQ9Analysis
from app.db.session import get_db

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