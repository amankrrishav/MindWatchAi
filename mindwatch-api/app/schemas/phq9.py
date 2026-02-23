from pydantic import BaseModel
from typing import Any


class PHQ9In(BaseModel):
    user_id: str
    score: int


class PHQ9AnalysisRequest(BaseModel):
    answers: dict[str, int]
    user_id: str
    session_id: str


class PHQ9AnalysisResponse(BaseModel):
    total_score: int
    severity: str
    suicide_risk: bool
