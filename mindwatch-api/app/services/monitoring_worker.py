"""Monitoring worker: risk computation, trend detection, alerts, snapshots."""
import asyncio
import signal
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis
from app.services.risk_engine import compute_risk_v2
from app.services.alert_service import evaluate_and_create_alert
from app.services.risk_snapshot_service import create_risk_snapshot
from app.services.monitoring_state_service import get_or_create_state, update_state
from app.services.risk_trend_service import detect_risk_trend
from app.services.risk_trend_event_service import store_trend_event
from app.services.monitoring_heartbeat import update_heartbeat


shutdown_event = asyncio.Event()
CHECK_INTERVAL = 300
FAILURE_BACKOFF = 15
ESCALATION_THRESHOLD = 2
COOLDOWN_THRESHOLD = 3
TREND_STREAK_THRESHOLD = 2


def _handle_shutdown(sig, frame):
    shutdown_event.set()


signal.signal(signal.SIGINT, _handle_shutdown)
signal.signal(signal.SIGTERM, _handle_shutdown)


async def monitoring_worker() -> None:
    from app.config import get_settings
    interval = get_settings().monitoring_interval_seconds

    while not shutdown_event.is_set():
        db: Session = SessionLocal()
        update_heartbeat()
        try:
            user_ids = [r[0] for r in db.query(PHQ9Analysis.user_id).distinct().all()]
            for user_id in user_ids:
                if shutdown_event.is_set():
                    break
                try:
                    risk = compute_risk_v2(user_id, db)
                    level = risk["risk_level"]
                    confidence = risk["confidence"]
                    state = get_or_create_state(user_id, db)

                    if state.last_risk is None:
                        update_state(
                            state,
                            last_risk=level,
                            last_confidence=confidence,
                            high_streak=0,
                            cooldown_streak=0,
                            trend_streak=0,
                            last_trend=None,
                            db=db,
                        )
                        continue

                    trend = detect_risk_trend(user_id=user_id, db=db, lookback_hours=24)
                    if trend["trend_detected"]:
                        current_trend = trend["severity"]
                        state.trend_streak = (state.trend_streak or 0) + 1 if state.last_trend == current_trend else 1
                        if (
                            state.last_risk != level
                            and (state.trend_streak or 0) >= TREND_STREAK_THRESHOLD
                        ):
                            store_trend_event(
                                user_id=user_id,
                                direction=trend["direction"],
                                severity=trend["severity"],
                                reason=trend["reason"] or "",
                                db=db,
                            )
                        state.last_trend = current_trend
                    else:
                        state.trend_streak = 0
                        state.last_trend = None

                    if level == "high":
                        state.high_streak = (state.high_streak or 0) + 1
                        state.cooldown_streak = 0
                        if (state.high_streak or 0) == ESCALATION_THRESHOLD:
                            create_risk_snapshot(user_id, db)
                            evaluate_and_create_alert(user_id, db)
                    else:
                        state.cooldown_streak = (state.cooldown_streak or 0) + 1
                        state.high_streak = 0
                        if (state.cooldown_streak or 0) == COOLDOWN_THRESHOLD:
                            create_risk_snapshot(user_id, db)

                    update_state(
                        state,
                        last_risk=level,
                        last_confidence=confidence,
                        high_streak=state.high_streak or 0,
                        cooldown_streak=state.cooldown_streak or 0,
                        trend_streak=state.trend_streak or 0,
                        last_trend=state.last_trend,
                        db=db,
                    )
                except (SQLAlchemyError, Exception):
                    db.rollback()
                    continue
        except Exception:
            await asyncio.sleep(FAILURE_BACKOFF)
        finally:
            db.close()
        await asyncio.sleep(interval)
