from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class RiskAlertResponse(BaseModel):
    id: int
    user_id: str
    risk_level: str
    confidence: float
    reasons: List[str]
    acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True