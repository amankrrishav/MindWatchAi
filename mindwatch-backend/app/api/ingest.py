from fastapi import APIRouter
from app.schemas.behavior import BehaviorIn
from app.schemas.phq9 import PHQ9In
from app.db.session import SessionLocal
from app.db.models import BehaviorEvent, PHQ9Label

router = APIRouter()

@router.post("/behavior")
def ingest_behavior(data: BehaviorIn):
    db = SessionLocal()
    event = BehaviorEvent(
        user_id=data.user_id,
        timestamp=data.timestamp,
        features=data.features
    )
    db.add(event)
    db.commit()
    db.close()
    return {"status": "saved"}

@router.post("/phq9")
def ingest_phq9(data: PHQ9In):
    db = SessionLocal()
    label = PHQ9Label(
        user_id=data.user_id,
        score=data.score
    )
    db.add(label)
    db.commit()
    db.close()
    return {"status": "saved"}