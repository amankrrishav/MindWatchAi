"""Create notification intents. Does NOT send push/email — that's a separate delivery layer."""
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.db.models import NotificationIntent


def create_notification_intent(
    db: Session,
    user_id: str,
    intent_type: str,
    priority: str,
    reason: str,
    source: str,
    silent_allowed: bool = False,
) -> NotificationIntent:
    """Create a notification intent. Caller must commit."""
    intent = NotificationIntent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        intent_type=intent_type,
        priority=priority,
        silent_allowed=silent_allowed,
        reason=reason,
        source=source,
        suppressed=False,
    )
    db.add(intent)
    return intent
