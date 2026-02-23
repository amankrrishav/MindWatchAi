"""
MindWatch database models. Compatible with SQLite (dev) and PostgreSQL (prod).
"""
from sqlalchemy import (
    Column,
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

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    features = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# PHQ-9 Labels (Raw Scores)
# ---------------------------------------------------------------------------


class PHQ9Label(Base):
    __tablename__ = "phq9_labels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# PHQ-9 Analysis (Derived Layer)
# ---------------------------------------------------------------------------


class PHQ9Analysis(Base):
    __tablename__ = "phq9_analysis"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(64), nullable=False, index=True)
    session_id = Column(String(64), nullable=False)
    total_score = Column(Integer, nullable=False)
    severity = Column(String(32), nullable=False)
    suicide_risk = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Risk Alerts
# ---------------------------------------------------------------------------


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    risk_level = Column(String(32), nullable=False)
    confidence = Column(Float, nullable=False)
    reasons = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Behavior Feature Aggregates
# ---------------------------------------------------------------------------


class BehaviorFeature(Base):
    __tablename__ = "behavior_features"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    event_count_24h = Column(Integer, nullable=False)
    event_count_7d = Column(Integer, nullable=False)
    negative_event_ratio = Column(Float, nullable=False)
    volatility_score = Column(Float, nullable=False)
    last_event_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Risk Snapshots (Time Series)
# ---------------------------------------------------------------------------


class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    risk_level = Column(String(32), nullable=False)
    confidence = Column(Float, nullable=False)
    reasons = Column(JSON, nullable=False)
    engine_version = Column(String(16), default="v2")
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (Index("idx_risk_snapshots_user_time", "user_id", "created_at"),)


# ---------------------------------------------------------------------------
# Monitoring State (Persistent)
# ---------------------------------------------------------------------------


class MonitoringState(Base):
    __tablename__ = "monitoring_state"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    last_risk = Column(String(32), nullable=True)
    last_confidence = Column(Float, nullable=True)
    high_streak = Column(Integer, default=0)
    cooldown_streak = Column(Integer, default=0)
    trend_streak = Column(Integer, default=0)
    last_trend = Column(String(32), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# ---------------------------------------------------------------------------
# Risk Trend Events
# ---------------------------------------------------------------------------


class RiskTrendEvent(Base):
    __tablename__ = "risk_trend_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    direction = Column(String(32), nullable=False)
    severity = Column(String(32), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (Index("idx_trend_events_user_time", "user_id", "created_at"),)


# ---------------------------------------------------------------------------
# Orchestration Decisions
# ---------------------------------------------------------------------------


class OrchestrationDecision(Base):
    __tablename__ = "orchestration_decisions"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(64), index=True, nullable=False)
    decision = Column(String(32), nullable=False)
    uncertainty_reason = Column(String(64), nullable=True)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Human Questions
# ---------------------------------------------------------------------------


class HumanQuestion(Base):
    __tablename__ = "human_questions"

    id = Column(String(64), primary_key=True)
    clinical_key = Column(String(64), nullable=False)
    question_text = Column(String(512), nullable=False)
    risk_level = Column(String(32), nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Human Answers
# ---------------------------------------------------------------------------


class HumanAnswer(Base):
    __tablename__ = "human_answers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), nullable=False, index=True)
    question_id = Column(String(64), nullable=False, index=True)
    answer_key = Column(String(64), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# ---------------------------------------------------------------------------
# Answer → PHQ Mapping
# ---------------------------------------------------------------------------


class AnswerPHQMapping(Base):
    __tablename__ = "answer_phq_mapping"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    clinical_key = Column(String(64), nullable=False)
    answer_key = Column(String(64), nullable=False)
    phq_score = Column(Integer, nullable=False)


# ---------------------------------------------------------------------------
# Question Guardrail State
# ---------------------------------------------------------------------------


class QuestionGuardrailState(Base):
    __tablename__ = "question_guardrail_state"

    user_id = Column(String(64), primary_key=True)
    last_question_at = Column(DateTime)
    last_answer_at = Column(DateTime)
    last_skip_at = Column(DateTime)
    questions_today = Column(Integer, nullable=False, default=0)
    skips_today = Column(Integer, nullable=False, default=0)
    cooldown_until = Column(DateTime)
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


# ---------------------------------------------------------------------------
# Notification Intents
# ---------------------------------------------------------------------------


class NotificationIntent(Base):
    __tablename__ = "notification_intents"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(64), index=True, nullable=False)
    intent_type = Column(String(50), nullable=False)
    priority = Column(String(20), nullable=False)
    silent_allowed = Column(Boolean, nullable=False, default=True)
    reason = Column(Text, nullable=False)
    source = Column(String(50), nullable=False)
    suppressed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    handled_at = Column(DateTime, nullable=True)
