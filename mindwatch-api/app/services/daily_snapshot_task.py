"""Daily snapshot worker: stores risk snapshots for all users."""
import asyncio
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis
from app.services.risk_snapshot_service import create_risk_snapshot


async def daily_snapshot_worker() -> None:
    from app.config import get_settings
    interval = get_settings().snapshot_interval_seconds

    while True:
        db: Session = SessionLocal()
        try:
            user_ids = [r[0] for r in db.query(PHQ9Analysis.user_id).distinct().all()]
            for uid in user_ids:
                create_risk_snapshot(uid, db)
        except Exception:
            db.rollback()
        finally:
            db.close()
        await asyncio.sleep(interval)
