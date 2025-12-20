from datetime import datetime, timedelta
from typing import List


def freshness_score(last_seen_at: datetime) -> float:
    age = datetime.utcnow() - last_seen_at

    if age <= timedelta(hours=24):
        return 1.0
    if age <= timedelta(days=3):
        return 0.7
    if age <= timedelta(days=7):
        return 0.4
    return 0.1


def consistency_score(recent_levels: List[str]) -> float:
    if not recent_levels:
        return 0.0

    unique = set(recent_levels)

    if len(unique) == 1:
        return 1.0
    if len(unique) == 2:
        return 0.6
    return 0.3


def confidence_score(
    recent_levels: List[str],
    last_snapshot_time: datetime,
    signal_volume_score: float,
    device_health_score: float,
) -> float:
    c1 = consistency_score(recent_levels)
    c2 = freshness_score(last_snapshot_time)
    c3 = signal_volume_score
    c4 = device_health_score

    score = (
        0.40 * c1 +
        0.30 * c2 +
        0.20 * c3 +
        0.10 * c4
    )

    return round(min(max(score, 0.0), 1.0), 2)