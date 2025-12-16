from pydantic import BaseModel
from typing import List
from datetime import datetime


class TimelineEntry(BaseModel):
    timestamp: datetime
    source: str
    severity: str
    risk_level: str
    confidence: float
    reasons: List[str]


class UserTimelineResponse(BaseModel):
    user_id: str
    timeline: List[TimelineEntry]