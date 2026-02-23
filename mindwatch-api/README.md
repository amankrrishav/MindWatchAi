# MindWatch API

FastAPI backend for MindWatch — clinically grounded mental health monitoring.

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs

## Config

Copy `.env.example` to `.env`. Key variables:

- `DATABASE_URL` — SQLite or PostgreSQL
- `AUTH_MODE` — `header` (dev) or `jwt` (prod)
- `CORS_ORIGINS` — Allowed frontend origins
