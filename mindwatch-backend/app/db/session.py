from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL
from app.db.base import Base

# -------------------------------
# Database Engine
# -------------------------------

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# -------------------------------
# Session Factory
# -------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# -------------------------------
# FastAPI Dependency
# -------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# DB Initializer (used in main.py)
# -------------------------------

def init_db():
    Base.metadata.create_all(bind=engine)