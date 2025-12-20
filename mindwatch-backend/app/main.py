from fastapi import FastAPI
import asyncio

from fastapi.middleware.cors import CORSMiddleware

from app.api import ingest, predict
from app.db.session import init_db
from app.services.daily_snapshot_task import daily_snapshot_worker
from app.services.monitoring_worker import monitoring_worker


# from app.api import questions
from app.api import questions


app = FastAPI(title="MindWatch Backend")

# -------------------------------
# CORS (Frontend Access)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Startup Events
# -------------------------------
@app.on_event("startup")
async def startup():
    # Initialize database (create tables if needed)
    init_db()

    # Background tasks
    asyncio.create_task(daily_snapshot_worker())   # once per day
    asyncio.create_task(monitoring_worker())       # every 5 minutes


# -------------------------------
# Routers
# -------------------------------
app.include_router(ingest.router, prefix="/ingest")
app.include_router(predict.router, prefix="/predict")
app.include_router(questions.router)