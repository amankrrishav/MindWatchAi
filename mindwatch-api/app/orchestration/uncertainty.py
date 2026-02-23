from datetime import datetime, timedelta
from typing import Optional


def detect_uncertainty(
    recent_levels: list[str],
    last_snapshot_time: Optional[datetime],
    signal_volume_score: float,
    device_health_score: float,
):
    if not recent_levels or last_snapshot_time is None:
        return "no_recent_data"
    age = datetime.utcnow() - last_snapshot_time
    if age > timedelta(days=7):
        return "stale_data"
    if len(set(recent_levels)) >= 3:
        return "inconsistent_signals"
    if signal_volume_score < 0.4:
        return "low_signal_volume"
    if device_health_score < 0.5:
        return "device_unhealthy"
    return None
