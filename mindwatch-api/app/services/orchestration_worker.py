"""
Orchestration worker: creates OrchestrationDecision records.
Runs on a schedule; questions API reads these to determine whether to show a question.
"""
from typing import Optional
import asyncio
import signal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import PHQ9Analysis, RiskSnapshot, OrchestrationDecision, WellnessCheckIn
from app.orchestration.confidence import confidence_score
from app.orchestration.uncertainty import detect_uncertainty
from app.orchestration.decision import decide_ask_or_not


shutdown_event = asyncio.Event()


def _handle_shutdown(sig, frame):
    shutdown_event.set()


signal.signal(signal.SIGINT, _handle_shutdown)
signal.signal(signal.SIGTERM, _handle_shutdown)


def _compute_orchestration_inputs(user_id: str, db: Session):
    """Gather data needed for orchestration decision."""
    since = datetime.utcnow() - timedelta(days=7)
    snapshots = (
        db.query(RiskSnapshot)
        .filter(
            RiskSnapshot.user_id == user_id,
            RiskSnapshot.created_at >= since,
        )
        .order_by(RiskSnapshot.created_at.desc())
        .limit(10)
        .all()
    )
    if not snapshots:
        # New users with PHQ9 or Wellness but no snapshots: create "ask" to bootstrap
        has_phq9 = db.query(PHQ9Analysis).filter(PHQ9Analysis.user_id == user_id).first()
        has_wellness = db.query(WellnessCheckIn).filter(WellnessCheckIn.user_id == user_id).first()
        if has_phq9 or has_wellness:
            return {
                "recent_levels": [],
                "last_snapshot_time": None,
                "signal_volume_score": 0.0,
                "device_health_score": 1.0,
                "force_ask": True,
            }
        return None
    recent_levels = [s.risk_level for s in snapshots]
    last_snapshot_time = snapshots[0].created_at
    signal_volume = min(1.0, len(snapshots) / 5.0)
    device_health = 1.0
    return {
        "recent_levels": recent_levels,
        "last_snapshot_time": last_snapshot_time,
        "signal_volume_score": signal_volume,
        "device_health_score": device_health,
        "force_ask": False,
    }


def _run_orchestration_for_user(user_id: str, db: Session) -> None:
    inputs = _compute_orchestration_inputs(user_id, db)
    if not inputs:
        return

    if inputs.get("force_ask"):
        result = {"decision": "ask", "explanation": "New user, collecting baseline"}
        uncertainty = "no_recent_data"
        conf = 0.0
    else:
        conf = confidence_score(
            inputs["recent_levels"],
            inputs["last_snapshot_time"],
            inputs["signal_volume_score"],
            inputs["device_health_score"],
        )
        uncertainty = detect_uncertainty(
            inputs["recent_levels"],
            inputs["last_snapshot_time"],
            inputs["signal_volume_score"],
            inputs["device_health_score"],
        )
        result = decide_ask_or_not(conf, uncertainty)

    decision = OrchestrationDecision(
        user_id=user_id,
        decision=result["decision"],
        uncertainty_reason=uncertainty,
        confidence=conf,
    )
    db.add(decision)
    db.commit()


async def orchestration_worker() -> None:
    """Background worker that creates orchestration decisions for all users with data."""
    from app.config import get_settings
    interval = get_settings().orchestration_interval_seconds

    while not shutdown_event.is_set():
        db: Session = SessionLocal()
        try:
            phq9_uids = [r[0] for r in db.query(PHQ9Analysis.user_id).distinct().all()]
            wellness_uids = [r[0] for r in db.query(WellnessCheckIn.user_id).distinct().all()]
            user_ids = list(set(phq9_uids + wellness_uids))
            
            for uid in user_ids:
                if shutdown_event.is_set():
                    break
                try:
                    _run_orchestration_for_user(uid, db)
                except Exception as e:
                    db.rollback()
                    continue
        finally:
            db.close()
        await asyncio.sleep(interval)
