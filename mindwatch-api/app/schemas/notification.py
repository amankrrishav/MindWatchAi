from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationIntentResponse(BaseModel):
    id: str
    user_id: str
    intent_type: str
    priority: str
    reason: str
    source: str
    created_at: datetime
    handled_at: Optional[datetime] = None
