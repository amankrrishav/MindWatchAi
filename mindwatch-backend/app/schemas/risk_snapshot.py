from pydantic import BaseModel
from datetime import datetime
from typing import List


class RiskSnapshotResponse(BaseModel):
    id: int
    user_id: str
    risk_level: str
    confidence: float
    reasons: List[str]
    engine_version: str
    created_at: datetime