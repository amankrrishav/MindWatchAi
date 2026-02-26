"""Daily snapshot worker: stores risk snapshots for all users."""
import asyncio
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis, WellnessCheckIn
from app.services.risk_snapshot_service import create_risk_snapshot


async def daily_snapshot_worker() -> None:
    from app.config import get_settings
    interval = get_settings().snapshot_interval_seconds

    while True:
        db: Session = SessionLocal()
        try:
            phq9_uids = [r[0] for r in db.query(PHQ9Analysis.user_id).distinct().all()]
            wellness_uids = [r[0] for r in db.query(WellnessCheckIn.user_id).distinct().all()]
            user_ids = list(set(phq9_uids + wellness_uids))
            for uid in user_ids:
                create_risk_snapshot(uid, db)
        except Exception:
            db.rollback()
        finally:
            db.close()
        await asyncio.sleep(interval)
