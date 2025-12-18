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
from app.services.risk_trend_service import detect_risk_trend
from app.services.risk_trend_event_service import store_trend_event


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
                # -------------------------------
                # Compute current risk
                # -------------------------------
                risk = compute_risk_v2(user_id, db)
                level = risk["risk_level"]
                confidence = risk["confidence"]

                # -------------------------------
                # Load persisted monitoring state
                # -------------------------------
                state = get_or_create_state(user_id, db)

                previous_level = state.last_risk

                # -------------------------------
                # 🔥 PHASE 11B.2 — Trend detection
                # -------------------------------
                trend = detect_risk_trend(
                    user_id=user_id,
                    db=db,
                    lookback_hours=24,
                )

                # ✅ Store trend ONLY on actual transition
                if (
                    trend["trend_detected"]
                    and previous_level is not None
                    and previous_level != level
                ):
                    print(
                        f"[Monitoring][TREND] {user_id}: "
                        f"{trend['severity']} | {trend['reason']}"
                    )

                    store_trend_event(
                        user_id=user_id,
                        direction=trend["direction"],
                        severity=trend["severity"],
                        reason=trend["reason"],
                        db=db,
                    )

                # -------------------------------
                # Escalation logic (alerts)
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
                # Cooldown / recovery logic
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
                # Persist monitoring state
                # -------------------------------
                update_state(
                    state,
                    last_risk=level,
                    last_confidence=confidence,
                    high_streak=state.high_streak,
                    cooldown_streak=state.cooldown_streak,
                    db=db,
                )

        except Exception as e:
            print("[Monitoring][ERROR]", e)

        finally:
            db.close()

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)