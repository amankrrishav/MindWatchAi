import uuid
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models import NotificationIntent


def create_notification_intent(
    *,
    db: Session,
    user_id: str,
    intent_type: str,
    priority: str,
    reason: str,
    source: str,
    silent_allowed: bool = True,
) -> NotificationIntent:
    """
    Creates a notification intent.
    Does NOT send anything.
    Does NOT decide delivery.
    """

    intent = NotificationIntent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        intent_type=intent_type,
        priority=priority,
        silent_allowed=silent_allowed,
        reason=reason,
        source=source,
        suppressed=False,
        created_at=datetime.utcnow(),
    )

    db.add(intent)
    return intent