"""Notifications API: fetch unread, mark as handled."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.db.session import get_db
from app.db.models import NotificationIntent
from app.auth.context import get_current_user_id
from sqlalchemy.orm import Session

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list)
def get_unread_notifications(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return notification intents that haven't been handled."""
    intents = (
        db.query(NotificationIntent)
        .filter(
            NotificationIntent.user_id == user_id,
            NotificationIntent.handled_at.is_(None),
            NotificationIntent.suppressed == False,
        )
        .order_by(NotificationIntent.created_at.desc())
        .all()
    )
    return [
        {
            "id": i.id,
            "user_id": i.user_id,
            "intent_type": i.intent_type,
            "priority": i.priority,
            "reason": i.reason,
            "source": i.source,
            "created_at": i.created_at,
            "handled_at": i.handled_at,
        }
        for i in intents
    ]


@router.patch("/{intent_id}/handled")
def mark_notification_handled(
    intent_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Mark a notification intent as handled (seen by user)."""
    intent = (
        db.query(NotificationIntent)
        .filter(
            NotificationIntent.id == intent_id,
            NotificationIntent.user_id == user_id,
        )
        .first()
    )
    if not intent:
        raise HTTPException(status_code=404, detail="Notification not found")
    intent.handled_at = datetime.utcnow()
    db.commit()
    return {"status": "handled"}
