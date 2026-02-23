from pydantic import BaseModel
from datetime import datetime


class TimelineEntry(BaseModel):
    timestamp: datetime
    source: str
    severity: str
    risk_level: str
    confidence: float
    reasons: list[str]


class UserTimelineResponse(BaseModel):
    user_id: str
    timeline: list[TimelineEntry]
