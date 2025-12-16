from pydantic import BaseModel
from typing import List


class RiskResponse(BaseModel):
    user_id: str
    risk_level: str
    confidence: float
    reasons: List[str]