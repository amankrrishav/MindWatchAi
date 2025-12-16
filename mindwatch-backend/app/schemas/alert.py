from pydantic import BaseModel
from datetime import datetime


class RiskAlertResponse(BaseModel):
    id: int
    user_id: str
    risk_level: str
    confidence: int
    reason: str
    acknowledged: bool
    created_at: datetime