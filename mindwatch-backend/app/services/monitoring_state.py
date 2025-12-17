from datetime import datetime
from typing import Dict

# In-memory state (safe for now, DB later if needed)
_monitoring_state: Dict[str, dict] = {}


def get_last_state(user_id: str):
    return _monitoring_state.get(user_id)


def update_state(user_id: str, risk_level: str, confidence: float):
    _monitoring_state[user_id] = {
        "risk_level": risk_level,
        "confidence": confidence,
        "checked_at": datetime.utcnow()
    }