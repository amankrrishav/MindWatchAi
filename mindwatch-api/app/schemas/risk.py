from pydantic import BaseModel


class RiskResponse(BaseModel):
    user_id: str
    risk_level: str
    confidence: float
    reasons: list[str]
