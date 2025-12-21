from sqlalchemy import (
    Column,
    Float,
    Integer,
    String,
    DateTime,
    Boolean,
    JSON,
    Index,
)
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import BLOB
from datetime import datetime
import uuid

from app.db.base import Base


# -------------------------------
# Raw Behavior Events
# -------------------------------

class BehaviorEvent(Base):
    __tablename__ = "behavior_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    timestamp = Column(DateTime, nullable=False)
    features = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------
# PHQ-9 Labels (Raw Scores)
# -------------------------------

class PHQ9Label(Base):
    __tablename__ = "phq9_labels"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------
# PHQ-9 Analysis (Derived Layer)
# -------------------------------

class PHQ9Analysis(Base):
    __tablename__ = "phq9_analysis"

    id = Column(
        BLOB,
        primary_key=True,
        default=lambda: uuid.uuid4().bytes,
    )

    user_id = Column(String, nullable=False, index=True)
    session_id = Column(String, nullable=False)

    total_score = Column(Integer, nullable=False)
    severity = Column(String, nullable=False)
    suicide_risk = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())


# -------------------------------
# Risk Alerts
# -------------------------------

class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    risk_level = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    reasons = Column(String, nullable=False)

    acknowledged = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------
# Behavior Feature Aggregates
# -------------------------------

class BehaviorFeature(Base):
    __tablename__ = "behavior_features"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    event_count_24h = Column(Integer, nullable=False)
    event_count_7d = Column(Integer, nullable=False)
    negative_event_ratio = Column(Float, nullable=False)
    volatility_score = Column(Float, nullable=False)

    last_event_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------
# Risk Snapshots (Time Series)
# -------------------------------

class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    risk_level = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    reasons = Column(JSON, nullable=False)

    engine_version = Column(String, default="v2")
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_risk_snapshots_user_time", "user_id", "created_at"),
    )


# -------------------------------
# Monitoring State (Persistent)
# -------------------------------

class MonitoringState(Base):
    __tablename__ = "monitoring_state"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)

    last_risk = Column(String, nullable=True)
    last_confidence = Column(Float, nullable=True)

    high_streak = Column(Integer, default=0)
    cooldown_streak = Column(Integer, default=0)

    # 🔥 Phase 11B.3 — Trend memory
    trend_streak = Column(Integer, default=0)
    last_trend = Column(String, nullable=True)  # accelerating / recovering

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# -------------------------------
# Risk Trend Events (Early Warnings)
# -------------------------------

class RiskTrendEvent(Base):
    __tablename__ = "risk_trend_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    direction = Column(String, nullable=False)   # up / down
    severity = Column(String, nullable=False)    # accelerating / recovering
    reason = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_trend_events_user_time", "user_id", "created_at"),
    )

# -------------------------------
# Orchestration Decisions (Phase 14)
# -------------------------------

class OrchestrationDecision(Base):
    __tablename__ = "orchestration_decisions"

    id = Column(
        BLOB,
        primary_key=True,
        default=lambda: uuid.uuid4().bytes,
    )

    user_id = Column(String, index=True, nullable=False)

    decision = Column(String, nullable=False)  # ask / dont_ask
    uncertainty_reason = Column(String, nullable=True)

    confidence = Column(Float, nullable=False)

    created_at = Column(DateTime, server_default=func.now())


# -------------------------------
# Human Questions (Phase 15)
# -------------------------------

class HumanQuestion(Base):
    __tablename__ = "human_questions"

    id = Column(String, primary_key=True)  # stable question id (q-1, q-2…)

    clinical_key = Column(String, nullable=False)
    question_text = Column(String, nullable=False)

    risk_level = Column(String, nullable=False)  # low / medium / high
    active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())       


# -------------------------------
# Human Answers (Phase 15)
# -------------------------------

class HumanAnswer(Base):
    __tablename__ = "human_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    question_id = Column(String, nullable=False)
    answer_key = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

# -------------------------------
# Answer → PHQ Mapping (Phase 15)
# -------------------------------

class AnswerPHQMapping(Base):
    __tablename__ = "answer_phq_mapping"

    id = Column(Integer, primary_key=True, index=True)

    clinical_key = Column(String, nullable=False)
    answer_key = Column(String, nullable=False)
    phq_score = Column(Integer, nullable=False)

class QuestionGuardrailState(Base):
    __tablename__ = "question_guardrail_state"

    user_id = Column(String, primary_key=True)

    last_question_at = Column(DateTime)
    last_answer_at = Column(DateTime)
    last_skip_at = Column(DateTime)

    questions_today = Column(Integer, nullable=False, default=0)
    skips_today = Column(Integer, nullable=False, default=0)

    cooldown_until = Column(DateTime)
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())    