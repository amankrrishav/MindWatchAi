"""
Database session management. Host-agnostic: works with SQLite or PostgreSQL via DATABASE_URL.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import get_settings
from app.db.base import Base
from app.db.models import (  # noqa: F401 - ensure models are registered
    BehaviorEvent,
    PHQ9Label,
    PHQ9Analysis,
    RiskAlert,
    BehaviorFeature,
    RiskSnapshot,
    MonitoringState,
    RiskTrendEvent,
    OrchestrationDecision,
    HumanQuestion,
    HumanAnswer,
    AnswerPHQMapping,
    QuestionGuardrailState,
    NotificationIntent,
    User,
    WellnessCheckIn,
    UserConsent,
)


def _get_connect_args():
    """SQLite needs check_same_thread=False for FastAPI."""
    url = get_settings().database_url
    if url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(
    get_settings().database_url,
    connect_args=_get_connect_args(),
    echo=get_settings().debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on startup."""
    Base.metadata.create_all(bind=engine)
