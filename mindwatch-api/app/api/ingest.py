"""Ingest endpoints: behavior events, PHQ-9 labels."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import BehaviorEvent, PHQ9Label
from app.schemas.behavior import BehaviorIn
from app.schemas.phq9 import PHQ9In
from app.services.behavior_feature_service import extract_behavior_features

router = APIRouter(tags=["ingest"])


@router.post("/behavior")
def ingest_behavior(data: BehaviorIn, db: Session = Depends(get_db)):
    event = BehaviorEvent(
        user_id=data.user_id,
        timestamp=data.timestamp,
        features=data.features,
    )
    db.add(event)
    db.commit()
    # Extract features on ingest so risk engine has fresh data
    extract_behavior_features(data.user_id, db)
    return {"status": "saved"}


@router.post("/phq9")
def ingest_phq9(data: PHQ9In, db: Session = Depends(get_db)):
    label = PHQ9Label(user_id=data.user_id, score=data.score)
    db.add(label)
    db.commit()
    return {"status": "saved"}
