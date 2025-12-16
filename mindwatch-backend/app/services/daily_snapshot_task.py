import asyncio
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis
from app.services.risk_snapshot_service import create_risk_snapshot


SNAPSHOT_INTERVAL_SECONDS = 60 * 60 * 24  # 24 hours


async def daily_snapshot_worker():
    """
    Background task that runs once every 24 hours
    and stores risk snapshots for all active users.
    """

    while True:
        db: Session = SessionLocal()
        try:
            # Get distinct users with PHQ-9 data
            users = (
                db.query(PHQ9Analysis.user_id)
                .distinct()
                .all()
            )

            user_ids = [u[0] for u in users]

            for user_id in user_ids:
                create_risk_snapshot(user_id, db)

            print(f"[DailySnapshot] Stored snapshots for {len(user_ids)} users")

        except Exception as e:
            print("[DailySnapshot] Error:", e)

        finally:
            db.close()

        # Sleep until next run
        await asyncio.sleep(SNAPSHOT_INTERVAL_SECONDS)