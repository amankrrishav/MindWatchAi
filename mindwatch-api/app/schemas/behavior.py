from pydantic import BaseModel
from datetime import datetime
from typing import Any, Optional


class BehaviorIn(BaseModel):
    user_id: str
    timestamp: datetime
    features: Optional[dict] = None


class BehaviorFeatureResponse(BaseModel):
    user_id: str
    event_count_24h: int
    event_count_7d: int
    negative_event_ratio: float
    volatility_score: float
    last_event_at: Optional[datetime]
