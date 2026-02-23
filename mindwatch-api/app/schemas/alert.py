from pydantic import BaseModel
from datetime import datetime


class RiskAlertResponse(BaseModel):
    id: int
    user_id: str
    risk_level: str
    confidence: float
    reasons: list[str]
    acknowledged: bool
    created_at: datetime
