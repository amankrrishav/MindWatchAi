"""Monitoring worker: risk computation, trend detection, alerts, snapshots."""
import asyncio
import signal
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis, WellnessCheckIn, NotificationIntent
from app.services.risk_engine import compute_risk_v2
from app.services.risk_engine_v3 import compute_risk_v3
from app.services.alert_service import evaluate_and_create_alert
from app.services.risk_snapshot_service import create_risk_snapshot
from app.services.monitoring_state_service import get_or_create_state, update_state
from app.services.risk_trend_service import detect_risk_trend
from app.services.risk_trend_event_service import store_trend_event
from app.services.monitoring_heartbeat import update_heartbeat
from app.notifications.factory import create_notification_intent
from datetime import datetime, timedelta


shutdown_event = asyncio.Event()
CHECK_INTERVAL = 300
FAILURE_BACKOFF = 15


def _handle_shutdown(sig, frame):
    shutdown_event.set()


signal.signal(signal.SIGINT, _handle_shutdown)
signal.signal(signal.SIGTERM, _handle_shutdown)


def _run_monitoring_batch(shutdown_event_obj):
    from app.config import get_settings
    db: Session = SessionLocal()
    update_heartbeat()
    try:
        # Gather all user IDs from both PHQ-9 and wellness check-ins
        phq9_users = {r[0] for r in db.query(PHQ9Analysis.user_id).distinct().all()}
        checkin_users = {r[0] for r in db.query(WellnessCheckIn.user_id).distinct().all()}
        user_ids = list(phq9_users | checkin_users)

        for user_id in user_ids:
            if shutdown_event_obj.is_set():
                break
            try:
                # Use v3 when check-in data exists, fall back to v2
                if user_id in checkin_users:
                    v3 = compute_risk_v3(user_id, db)
                    level = v3["risk_level"]
                    confidence = v3["confidence"]
                else:
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
                        and (state.trend_streak or 0) >= get_settings().trend_streak_threshold
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
                    if (state.high_streak or 0) >= get_settings().monitoring_escalation_threshold:
                        create_risk_snapshot(user_id, db)
                        evaluate_and_create_alert(user_id, db)
                else:
                    if state.last_risk == "high" and level in ["medium", "low"]:
                        create_notification_intent(
                            db=db,
                            user_id=user_id,
                            intent_type="risk_improving",
                            priority="low",
                            reason="Risk level has improved to medium/low.",
                            source="monitoring_worker",
                            silent_allowed=True,
                        )
                        db.commit()
                        
                    state.cooldown_streak = (state.cooldown_streak or 0) + 1
                    state.high_streak = 0
                    if (state.cooldown_streak or 0) >= get_settings().monitoring_cooldown_threshold:
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
                
                # check_in_reminder missing 48h
                if user_id in checkin_users:
                    last_checkin = db.query(WellnessCheckIn).filter(WellnessCheckIn.user_id == user_id).order_by(WellnessCheckIn.created_at.desc()).first()
                    if last_checkin and last_checkin.created_at < datetime.utcnow() - timedelta(hours=48):
                        create_notification_intent(db=db, user_id=user_id, intent_type="check_in_reminder", priority="medium", reason="We haven't heard from you in 48h.", source="monitoring_worker")
                        
                # weekly digest every Sunday
                if datetime.utcnow().weekday() == 6:
                    has_digest = db.query(NotificationIntent).filter(NotificationIntent.user_id == user_id, NotificationIntent.intent_type == "weekly_digest", NotificationIntent.created_at >= datetime.utcnow() - timedelta(hours=24)).first()
                    if not has_digest:
                        create_notification_intent(db=db, user_id=user_id, intent_type="weekly_digest", priority="low", reason="Your weekly summary is ready.", source="monitoring_worker", silent_allowed=True)
                        db.commit()
                        
            except (SQLAlchemyError, Exception):
                db.rollback()
                continue
    finally:
        db.close()

async def monitoring_worker() -> None:
    from app.config import get_settings
    from starlette.concurrency import run_in_threadpool
    interval = get_settings().monitoring_interval_seconds

    while not shutdown_event.is_set():
        try:
            await run_in_threadpool(_run_monitoring_batch, shutdown_event)
        except Exception:
            await asyncio.sleep(FAILURE_BACKOFF)
            continue
        await asyncio.sleep(interval)
