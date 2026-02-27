"""
MindWatch database models. Compatible with SQLite (dev) and PostgreSQL (prod).
"""
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    Float,
    Integer,
    String,
    DateTime,
    Boolean,
    JSON,
    Index,
    Text,
)
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.db.base import Base


def uuid_str() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Raw Behavior Events
# ---------------------------------------------------------------------------


class BehaviorEvent(Base):
    __tablename__ = "behavior_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    features: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# PHQ-9 Labels (Raw Scores)
# ---------------------------------------------------------------------------


class PHQ9Label(Base):
    __tablename__ = "phq9_labels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# PHQ-9 Analysis (Derived Layer)
# ---------------------------------------------------------------------------


class PHQ9Analysis(Base):
    __tablename__ = "phq9_analysis"

    id: Mapped[str | None] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False)
    total_score: Mapped[int] = mapped_column(Integer, nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    suicide_risk: Mapped[bool | None] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Risk Alerts
# ---------------------------------------------------------------------------


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    reasons: Mapped[dict | list] = mapped_column(JSON, nullable=False)
    acknowledged: Mapped[bool | None] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Behavior Feature Aggregates
# ---------------------------------------------------------------------------


class BehaviorFeature(Base):
    __tablename__ = "behavior_features"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    event_count_24h: Mapped[int] = mapped_column(Integer, nullable=False)
    event_count_7d: Mapped[int] = mapped_column(Integer, nullable=False)
    negative_event_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    volatility_score: Mapped[float] = mapped_column(Float, nullable=False)
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Risk Snapshots (Time Series)
# ---------------------------------------------------------------------------


class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    reasons: Mapped[dict | list] = mapped_column(JSON, nullable=False)
    engine_version: Mapped[str | None] = mapped_column(String(16), default="v2")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (Index("idx_risk_snapshots_user_time", "user_id", "created_at"),)


# ---------------------------------------------------------------------------
# Monitoring State (Persistent)
# ---------------------------------------------------------------------------


class MonitoringState(Base):
    __tablename__ = "monitoring_state"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    last_risk: Mapped[str | None] = mapped_column(String(32), nullable=True)
    last_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    high_streak: Mapped[int | None] = mapped_column(Integer, default=0)
    cooldown_streak: Mapped[int | None] = mapped_column(Integer, default=0)
    trend_streak: Mapped[int | None] = mapped_column(Integer, default=0)
    last_trend: Mapped[str | None] = mapped_column(String(32), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


# ---------------------------------------------------------------------------
# Risk Trend Events
# ---------------------------------------------------------------------------


class RiskTrendEvent(Base):
    __tablename__ = "risk_trend_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    direction: Mapped[str] = mapped_column(String(32), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (Index("idx_trend_events_user_time", "user_id", "created_at"),)


# ---------------------------------------------------------------------------
# Orchestration Decisions
# ---------------------------------------------------------------------------


class OrchestrationDecision(Base):
    __tablename__ = "orchestration_decisions"

    id: Mapped[str | None] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    decision: Mapped[str] = mapped_column(String(32), nullable=False)
    uncertainty_reason: Mapped[str | None] = mapped_column(String(64), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Human Questions
# ---------------------------------------------------------------------------


class HumanQuestion(Base):
    __tablename__ = "human_questions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    clinical_key: Mapped[str] = mapped_column(String(64), nullable=False)
    question_text: Mapped[str] = mapped_column(String(512), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False)
    active: Mapped[bool | None] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Human Answers
# ---------------------------------------------------------------------------


class HumanAnswer(Base):
    __tablename__ = "human_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    answer_key: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Answer → PHQ Mapping
# ---------------------------------------------------------------------------


class AnswerPHQMapping(Base):
    __tablename__ = "answer_phq_mapping"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    clinical_key: Mapped[str] = mapped_column(String(64), nullable=False)
    answer_key: Mapped[str] = mapped_column(String(64), nullable=False)
    phq_score: Mapped[int] = mapped_column(Integer, nullable=False)


# ---------------------------------------------------------------------------
# Question Guardrail State
# ---------------------------------------------------------------------------


class QuestionGuardrailState(Base):
    __tablename__ = "question_guardrail_state"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    last_question_at: Mapped[datetime] = mapped_column(DateTime)
    last_answer_at: Mapped[datetime] = mapped_column(DateTime)
    last_skip_at: Mapped[datetime] = mapped_column(DateTime)
    questions_today: Mapped[int | None] = mapped_column(Integer, nullable=False, default=0)
    skips_today: Mapped[int | None] = mapped_column(Integer, nullable=False, default=0)
    cooldown_until: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


# ---------------------------------------------------------------------------
# Notification Intents
# ---------------------------------------------------------------------------


class NotificationIntent(Base):
    __tablename__ = "notification_intents"

    id: Mapped[str | None] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    intent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    silent_allowed: Mapped[bool | None] = mapped_column(Boolean, nullable=False, default=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    suppressed: Mapped[bool | None] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    handled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ---------------------------------------------------------------------------
# Users (Auth)
# ---------------------------------------------------------------------------


class User(Base):
    __tablename__ = "users"

    id: Mapped[str | None] = mapped_column(String(36), primary_key=True, default=uuid_str)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


# ---------------------------------------------------------------------------
# Wellness Check-Ins (7-signal daily check-in)
# ---------------------------------------------------------------------------


class WellnessCheckIn(Base):
    __tablename__ = "wellness_checkins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    mood: Mapped[int] = mapped_column(Integer, nullable=False)           # 1-5
    sleep_quality: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    energy: Mapped[int] = mapped_column(Integer, nullable=False)         # 1-5
    anxiety: Mapped[int] = mapped_column(Integer, nullable=False)        # 1-5  (higher = worse)
    social: Mapped[int] = mapped_column(Integer, nullable=False)         # 1-5
    focus: Mapped[int] = mapped_column(Integer, nullable=False)          # 1-5
    appetite: Mapped[int] = mapped_column(Integer, nullable=False)       # 1-5
    wellness_score: Mapped[float] = mapped_column(Float, nullable=False)   # 0-100 computed
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (Index("idx_checkins_user_time", "user_id", "created_at"),)


# ---------------------------------------------------------------------------
# User Consent (Privacy settings)
# ---------------------------------------------------------------------------


class UserConsent(Base):
    __tablename__ = "user_consent"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    data_collection: Mapped[bool | None] = mapped_column(Boolean, default=False, nullable=False)
    research_use: Mapped[bool | None] = mapped_column(Boolean, default=False, nullable=False)
    ai_analysis: Mapped[bool | None] = mapped_column(Boolean, default=False, nullable=False)
    notifications_ok: Mapped[bool | None] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

