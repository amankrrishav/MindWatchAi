from datetime import datetime
from threading import Lock
from typing import Optional

_last_heartbeat: Optional[datetime] = None
_lock = Lock()


def update_heartbeat() -> None:
    global _last_heartbeat
    with _lock:
        _last_heartbeat = datetime.utcnow()


def get_heartbeat() -> Optional[datetime]:
    with _lock:
        return _last_heartbeat
