import asyncio
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis
from app.services.risk_engine import compute_risk_v2
from app.services.alert_service import evaluate_and_create_alert
from app.services.risk_snapshot_service import create_risk_snapshot
from app.services.monitoring_state_service import (
    get_or_create_state,
    update_state,
)

# -------------------------------
# Monitoring configuration
# -------------------------------

CHECK_INTERVAL_SECONDS = 300   # 5 minutes
ESCALATION_THRESHOLD = 2       # High risk for 2 consecutive cycles
COOLDOWN_THRESHOLD = 3         # Low/Medium for 3 consecutive cycles


# -------------------------------
# Monitoring worker
# -------------------------------

async def monitoring_worker():
    print("[Monitoring] Continuous monitoring started")

    while True:
        db: Session = SessionLocal()

        try:
            # Monitor all users with PHQ-9 history
            user_ids = (
                db.query(PHQ9Analysis.user_id)
                .distinct()
                .all()
            )
            user_ids = [u[0] for u in user_ids]

            for user_id in user_ids:
                risk = compute_risk_v2(user_id, db)
                level = risk["risk_level"]

                # Persistent per-user monitoring state
                state = get_or_create_state(user_id, db)

                # -------------------------------
                # Escalation logic
                # -------------------------------
                if level == "high":
                    state.high_streak += 1
                    state.cooldown_streak = 0

                    if state.high_streak == ESCALATION_THRESHOLD:
                        print(
                            f"[Monitoring] Escalation threshold reached for {user_id}"
                        )
                        create_risk_snapshot(user_id, db)
                        evaluate_and_create_alert(user_id, db)

                # -------------------------------
                # Cooldown logic
                # -------------------------------
                else:
                    state.cooldown_streak += 1
                    state.high_streak = 0

                    if state.cooldown_streak == COOLDOWN_THRESHOLD:
                        print(
                            f"[Monitoring] Cooldown reached for {user_id} ({level})"
                        )
                        create_risk_snapshot(user_id, db)

                # -------------------------------
                # Risk transition logging
                # -------------------------------
                if state.last_risk != level:
                    print(
                        f"[Monitoring] Risk change detected for {user_id}: "
                        f"{state.last_risk} → {level}"
                    )

                # -------------------------------
                # Persist updated monitoring state
                # -------------------------------
                update_state(
                    state,
                    last_risk=level,
                    high_streak=state.high_streak,
                    cooldown_streak=state.cooldown_streak,
                    db=db,
                )

        except Exception as e:
            print("[Monitoring][ERROR]", e)

        finally:
            db.close()

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)