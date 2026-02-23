from pydantic import BaseModel


class ExplanationResponse(BaseModel):
    user_id: str
    risk_level: str
    confidence: float
    tone: str
    summary: str
    details: list[str]
