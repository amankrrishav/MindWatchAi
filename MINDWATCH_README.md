# MindWatch

Clinically grounded mental health monitoring. PHQ-9 + behavioral signals → deterministic risk assessment, orchestrated check-ins, and safety-first alerts.

## Structure

```
MindWatchAi/
├── mindwatch-api/     # FastAPI backend
├── mindwatch-web/     # React + TypeScript frontend
├── mindwatch-backend/ # (legacy now :sleeping) — use mindwatch-api
└── mindwatch-frontend/# (legacy now :sleeping) — use mindwatch-web
```

## Quick start

### 1. Backend (mindwatch-api)

```bash
cd mindwatch-api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs

### 2. Frontend (mindwatch-web)

```bash
cd mindwatch-web
npm install
npm run dev
```

App: http://localhost:5173

### 3. First run

1. Open the web app.
2. Click **Complete first assessment** to bootstrap PHQ-9 data.
3. Workers (monitoring, orchestration) run in the background.
4. After a few minutes, check-ins may appear.

## Configuration

### mindwatch-api

Create `mindwatch-api/.env`:

```env
# Database — swap provider by changing URL
DATABASE_URL=sqlite:///./mindwatch.db
# DATABASE_URL=postgresql://user:pass@host:5432/mindwatch

# Auth (header-based for dev)
AUTH_MODE=header

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:8000

# Workers (seconds)
MONITORING_INTERVAL_SECONDS=300
ORCHESTRATION_INTERVAL_SECONDS=600
SNAPSHOT_INTERVAL_SECONDS=86400
```

### mindwatch-web

Create `mindwatch-web/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Host-agnostic design

- **Database**: SQLite (dev) or PostgreSQL (Supabase, Neon, RDS) via `DATABASE_URL`
- **Auth**: Header-based (`X-User-Id`) for dev; extend with JWT/Supabase Auth
- **CORS**: Configurable origins
- **Deploy**: API → Render/Railway/Fly. Frontend → Vercel/Cloudflare Pages

## Architecture

See **mindwatch-api/ARCHITECTURE.md** for how the monitoring worker works and how behavioral data (typing patterns, screen time) would need to be collected by a client (extension, desktop app) and sent to `/ingest/behavior` — the server cannot access the user's system directly.

## Features

- PHQ-9 ingestion and scoring
- Behavioral event ingestion + feature extraction
- Risk Engine v1 (PHQ-9) + v2 (+ behavior)
- Orchestration worker → when to ask check-in questions
- Question flow with guardrails (cooldowns, daily limits)
- Monitoring worker (5 min) → trends, snapshots, alerts
- Daily snapshot worker
- Alert acknowledge / resolve
- In-app notifications (bell + banner when HIGH risk alert is created)
