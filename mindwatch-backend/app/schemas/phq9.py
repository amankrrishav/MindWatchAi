from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


# -------------------------------
# Raw PHQ-9 Input / Label Schema
# -------------------------------

class PHQ9In(BaseModel):
    user_id: str
    score: int
    recorded_at: Optional[datetime] = None


# -------------------------------
# PHQ-9 Analysis Schemas
# -------------------------------

class PHQ9AnalysisRequest(BaseModel):
    answers: Dict[str, int]
    user_id: str
    session_id: str


class PHQ9AnalysisResponse(BaseModel):
    total_score: int
    severity: str
    suicide_risk: bool