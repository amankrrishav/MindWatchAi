from sqlalchemy import Column, Float, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import BLOB
from datetime import datetime
import uuid

from app.db.base import Base


class BehaviorEvent(Base):
    __tablename__ = "behavior_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime)
    features = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class PHQ9Label(Base):
    __tablename__ = "phq9_labels"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------
# PHQ-9 Analysis (Derived Layer)
# -------------------------------

class PHQ9Analysis(Base):
    __tablename__ = "phq9_analysis"

    id = Column(BLOB, primary_key=True, default=lambda: uuid.uuid4().bytes)
    user_id = Column(String, nullable=False)
    session_id = Column(String, nullable=False)

    total_score = Column(Integer, nullable=False)
    severity = Column(String, nullable=False)
    suicide_risk = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())




#Risk Feature
class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    risk_level = Column(String)
    confidence = Column(Float)
    reasons = Column(String)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BehaviorFeature(Base):
    __tablename__ = "behavior_features"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)

    event_count_24h = Column(Integer)
    event_count_7d = Column(Integer)
    negative_event_ratio = Column(Float)
    volatility_score = Column(Float)

    last_event_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)

    risk_level = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    reasons = Column(JSON, nullable=False)

    engine_version = Column(String, default="v2")
    created_at = Column(DateTime, default=datetime.utcnow)       