"""Wellness check-in API: submit 7-signal check-ins, get wellness score."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import WellnessCheckIn, UserConsent, BehaviorEvent, NotificationIntent
from app.auth.context import get_current_user_id
from app.services.risk_engine_v3 import compute_wellness_score, compute_risk_v3
from app.notifications.factory import create_notification_intent

router = APIRouter(prefix="/wellness", tags=["wellness"])


class CheckInRequest(BaseModel):
    mood: int = Field(..., ge=1, le=5, description="1=very low … 5=excellent")
    sleep_quality: int = Field(..., ge=1, le=5)
    energy: int = Field(..., ge=1, le=5)
    anxiety: int = Field(..., ge=1, le=5, description="1=calm … 5=very anxious")
    social: int = Field(..., ge=1, le=5)
    focus: int = Field(..., ge=1, le=5)
    appetite: int = Field(..., ge=1, le=5)
    notes: Optional[str] = Field(None, max_length=1000)


class CheckInResponse(BaseModel):
    id: int
    user_id: str
    mood: int
    sleep_quality: int
    energy: int
    anxiety: int
    social: int
    focus: int
    appetite: int
    wellness_score: float
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class WellnessScoreResponse(BaseModel):
    user_id: str
    wellness_score: Optional[float]
    risk_level: str
    confidence: float
    reasons: list[dict]
    signals: Optional[dict]


class ConsentRequest(BaseModel):
    data_collection: bool = False
    research_use: bool = False
    ai_analysis: bool = False
    notifications_ok: bool = True


class ConsentResponse(BaseModel):
    user_id: str
    data_collection: bool
    research_use: bool
    ai_analysis: bool
    notifications_ok: bool
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.post("/checkin", response_model=CheckInResponse)
def submit_checkin(
    payload: CheckInRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Submit a 7-signal wellness check-in."""
    score = compute_wellness_score(
        mood=payload.mood,
        sleep_quality=payload.sleep_quality,
        energy=payload.energy,
        anxiety=payload.anxiety,
        social=payload.social,
        focus=payload.focus,
        appetite=payload.appetite,
    )
    checkin = WellnessCheckIn(
        user_id=user_id,
        mood=payload.mood,
        sleep_quality=payload.sleep_quality,
        energy=payload.energy,
        anxiety=payload.anxiety,
        social=payload.social,
        focus=payload.focus,
        appetite=payload.appetite,
        wellness_score=score,
        notes=payload.notes,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    # Wire into behavior pipeline so risk_engine_v3 has feature data
    sentiment = (payload.mood - 3) / 2  # maps 1-5 → -1.0 to +1.0
    event = BehaviorEvent(
        user_id=user_id,
        timestamp=datetime.utcnow(),
        features={"sentiment": sentiment},
    )
    db.add(event)
    db.commit()

    # Trigger score_high notification
    if score >= 80:
        # Check if they already got one recently
        existing_high = db.query(NotificationIntent).filter(
            NotificationIntent.user_id == user_id,
            NotificationIntent.intent_type == "score_high"
        ).first()
        if not existing_high:
            create_notification_intent(
                db=db,
                user_id=user_id,
                intent_type="score_high",
                priority="low",
                reason="Wellness score reached 80+!",
                source="wellness_api",
                silent_allowed=True,
            )
            db.commit()

    # Trigger streak milestones
    streak = db.query(WellnessCheckIn).filter(WellnessCheckIn.user_id == user_id).count()
    if streak in [7, 30, 100]:
        create_notification_intent(
            db=db,
            user_id=user_id,
            intent_type="streak_milestone",
            priority="low",
            reason=f"Reached a {streak}-day check-in streak!",
            source="wellness_api",
            silent_allowed=False,
        )
        db.commit()

    return checkin


@router.get("/score", response_model=WellnessScoreResponse)
def get_wellness_score(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get current wellness score and risk assessment for authenticated user."""
    result = compute_risk_v3(user_id, db)
    return {"user_id": user_id, **result}


@router.get("/history", response_model=list[CheckInResponse])
def get_checkin_history(
    limit: int = 30,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get recent check-in history for authenticated user."""
    return (
        db.query(WellnessCheckIn)
        .filter(WellnessCheckIn.user_id == user_id)
        .order_by(WellnessCheckIn.created_at.desc())
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------------------------
# Consent endpoints
# ---------------------------------------------------------------------------


@router.get("/consent", response_model=ConsentResponse)
def get_consent(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    consent = db.query(UserConsent).filter(UserConsent.user_id == user_id).first()
    if not consent:
        return ConsentResponse(
            user_id=user_id,
            data_collection=False,
            research_use=False,
            ai_analysis=False,
            notifications_ok=True,
            updated_at=None,
        )
    return consent


@router.put("/consent", response_model=ConsentResponse)
def update_consent(
    payload: ConsentRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    consent = db.query(UserConsent).filter(UserConsent.user_id == user_id).first()
    if not consent:
        consent = UserConsent(user_id=user_id)
        db.add(consent)

    consent.data_collection = payload.data_collection
    consent.research_use = payload.research_use
    consent.ai_analysis = payload.ai_analysis
    consent.notifications_ok = payload.notifications_ok
    db.commit()
    db.refresh(consent)
    return consent
