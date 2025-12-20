from datetime import datetime, timedelta
from typing import List, Optional


def detect_uncertainty(
    recent_levels: List[str],
    last_snapshot_time: Optional[datetime],
    signal_volume_score: float,
    device_health_score: float,
) -> Optional[str]:

    # 1. No data at all
    if not recent_levels or last_snapshot_time is None:
        return "no_recent_data"

    age = datetime.utcnow() - last_snapshot_time

    # 2. Very stale data
    if age > timedelta(days=7):
        return "stale_data"

    # 3. Inconsistent signals
    if len(set(recent_levels)) >= 3:
        return "inconsistent_signals"

    # 4. Low signal volume
    if signal_volume_score < 0.4:
        return "low_signal_volume"

    # 5. Device unhealthy
    if device_health_score < 0.5:
        return "device_unhealthy"

    return None