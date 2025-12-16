from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
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


#Risk A


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    risk_level = Column(String)
    confidence = Column(Integer)
    reason = Column(String)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)