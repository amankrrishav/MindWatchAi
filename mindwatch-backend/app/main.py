from fastapi import FastAPI
from app.api import ingest, predict
from app.db.session import init_db

app = FastAPI(title="MindWatch Backend")

@app.on_event("startup")
def startup():
    init_db()

app.include_router(ingest.router, prefix="/ingest")
app.include_router(predict.router, prefix="/predict")

@app.get("/")
def health():
    return {"status": "running"}