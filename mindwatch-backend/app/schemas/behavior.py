from pydantic import BaseModel
from datetime import datetime
from typing import Dict

# Schema for behavior event input data
class BehaviorIn(BaseModel):
    user_id: str
    timestamp: datetime
    features: Dict[str, float]


# Schema for behavior feature output data
class BehaviorFeatureResponse(BaseModel):
    user_id: str
    event_count_24h: int
    event_count_7d: int
    negative_event_ratio: float
    volatility_score: float
    last_event_at: datetime   