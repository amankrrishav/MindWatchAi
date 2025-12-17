from sqlalchemy import (
    Column,
    Float,
    Integer,
    String,
    DateTime,
    Boolean,
    JSON,
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


# -------------------------------
# Monitoring State (Persistent)
# -------------------------------

class MonitoringState(Base):
    __tablename__ = "monitoring_state"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)

    last_risk = Column(String, nullable=True)
    high_streak = Column(Integer, default=0)
    cooldown_streak = Column(Integer, default=0)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )