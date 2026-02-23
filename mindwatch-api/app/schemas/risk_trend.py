from pydantic import BaseModel
from datetime import datetime


class RiskTrendEventResponse(BaseModel):
    id: int
    user_id: str
    direction: str
    severity: str
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}
