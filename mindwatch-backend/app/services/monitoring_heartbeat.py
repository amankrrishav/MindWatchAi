from datetime import datetime
from threading import Lock

_last_heartbeat = None
_lock = Lock()


def update_heartbeat():
    global _last_heartbeat
    with _lock:
        _last_heartbeat = datetime.utcnow()


def get_heartbeat():
    with _lock:
        return _last_heartbeat