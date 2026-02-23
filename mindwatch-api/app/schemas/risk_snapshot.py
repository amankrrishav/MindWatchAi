from pydantic import BaseModel
from datetime import datetime


class RiskSnapshotResponse(BaseModel):
    id: int
    user_id: str
    risk_level: str
    confidence: float
    reasons: list[str]
    engine_version: str
    created_at: datetime
