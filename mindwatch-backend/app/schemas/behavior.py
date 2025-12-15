from pydantic import BaseModel
from datetime import datetime
from typing import Dict

class BehaviorIn(BaseModel):
    user_id: str
    timestamp: datetime
    features: Dict[str, float]