"""
MindWatch API - Clinically grounded mental health monitoring.
Host-agnostic: swap DB/Auth via environment variables.
"""
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings, get_cors_origins_list
from app.db.session import init_db
from app.db.seed import seed_if_empty
from app.api import ingest, predict, questions, notifications
from app.services.monitoring_worker import monitoring_worker
from app.services.daily_snapshot_task import daily_snapshot_worker
from app.services.orchestration_worker import orchestration_worker

app = FastAPI(
    title="MindWatch API",
    description="Clinically grounded mental health monitoring backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    from app.db.session import SessionLocal
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    asyncio.create_task(daily_snapshot_worker())
    asyncio.create_task(monitoring_worker())
    asyncio.create_task(orchestration_worker())


app.include_router(ingest.router, prefix="/ingest")
app.include_router(predict.router)
app.include_router(notifications.router)
app.include_router(questions.router)
