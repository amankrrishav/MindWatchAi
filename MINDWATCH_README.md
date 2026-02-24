# MindWatch

Clinically grounded mental health monitoring. PHQ-9 + 7-signal wellness check-ins + behavioral signals → deterministic risk assessment, orchestrated check-ins, and safety-first alerts.

## Structure

```
MindWatchAi/
├── mindwatch-api/      # FastAPI backend
└── mindwatch-web/      # React + TypeScript frontend
```

---

## Quick start

### 1. Backend

```bash
cd mindwatch-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install "bcrypt==4.0.1"   # required for Python 3.14 compatibility
uvicorn app.main:app --reload --port 8000
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd mindwatch-web
npm install
npm run dev
```

App: http://localhost:5173

### 3. First run

1. Open http://localhost:5173
2. Register an account (email + password)
3. Complete your first **wellness check-in** (7 signals → instant score)
4. Background workers start automatically — monitoring runs every 5 min

---

## Configuration

### mindwatch-api/.env

```env
DATABASE_URL=sqlite:///./mindwatch.db
# DATABASE_URL=postgresql://user:pass@host:5432/mindwatch

AUTH_MODE=jwt
JWT_SECRET=change-me-in-production

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

MONITORING_INTERVAL_SECONDS=300
ORCHESTRATION_INTERVAL_SECONDS=600
SNAPSHOT_INTERVAL_SECONDS=86400
```

### mindwatch-web/.env

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## Features

### Auth
- JWT-based registration and login (`/auth/register`, `/auth/login`, `/auth/me`)
- Token stored in `localStorage` (`mw_access_token`), auto-attached to all requests
- `AuthGate` component blocks the dashboard until authenticated

### Wellness Check-ins (v3 engine)
- 7-signal daily check-in: **Mood, Sleep, Energy, Anxiety, Social, Focus, Appetite** (each rated 1–5)
- Wellness score computed 0–100 (higher = healthier)
- Optional free-text notes per check-in
- Score interpretation: Thriving (80+) · Doing well (60+) · Moderate (40+) · Struggling (20+) · Crisis (<20)

### Risk Assessment
- **v2**: PHQ-9 + behavioral features → low / medium / high
- **v3**: Wellness check-in (7 signals) + PHQ-9 anchor + behavior modifier → 0–100 wellness score + risk level
- Monitoring worker uses v3 when check-in data exists, falls back to v2

### Dashboard — Wellness Tab
- Semi-circle gauge with live color coding
- 7-signal radar chart
- Sparkline trend over last N check-ins
- "+ New check-in" button

### Dashboard — Monitoring Tab
- Improving/worsening trend banner
- Risk overview card (engine version, confidence, last check-in)
- Dismissable alert cards
- Risk snapshot history table
- Question card (orchestrated PHQ-style check-in questions with guardrails)

### Dashboard — Privacy Tab
- Consent toggles: Data Collection, Anonymous Research, AI-Assisted Analysis, Wellness Notifications
- Persisted to `UserConsent` table via `/wellness/consent`

### Background Workers
| Worker | Interval | What it does |
|---|---|---|
| Monitoring | 5 min | Risk assessment for all users, trend detection, escalation alerts, snapshots |
| Orchestration | 10 min | Decides when to surface a check-in question |
| Daily Snapshot | 24 hr | Persists a risk snapshot for every active user |

### Alerts & Notifications
- Auto-created when risk stays HIGH for 2+ consecutive monitoring cycles
- In-app bell + banner when unread HIGH-risk alert exists
- Acknowledge / resolve actions
- Cooldown logic prevents alert spam

### API Endpoints (key)

```
POST /auth/register
POST /auth/login
GET  /auth/me

POST /wellness/checkin          # submit 7-signal check-in
GET  /wellness/score            # current wellness score (JWT)
GET  /wellness/history          # check-in history (JWT)
GET  /wellness/consent          # get consent settings (JWT)
PUT  /wellness/consent          # update consent settings (JWT)

GET  /predict/risk/me           # v3 risk for current user (JWT)
GET  /predict/risk/snapshots/me # snapshot history (JWT)
GET  /predict/alerts/me         # active alerts (JWT)
GET  /predict/trends/me         # risk trend events (JWT)
PATCH /predict/alerts/{id}/acknowledge
PATCH /predict/alerts/{id}/resolve

POST /ingest/behavior           # ingest behavioral events
GET  /predict/health            # worker liveness check
```

---

## Database Models

| Table | Purpose |
|---|---|
| `users` | Auth — email + bcrypt password hash |
| `wellness_checkins` | 7-signal check-ins + computed wellness score |
| `user_consent` | Per-user privacy preferences |
| `phq9_analysis` | PHQ-9 scored sessions |
| `risk_snapshots` | Point-in-time risk snapshots |
| `risk_alerts` | Escalated risk alerts |
| `risk_trend_events` | Detected improving/worsening trends |
| `monitoring_state` | Per-user worker state (streaks, cooldowns) |
| `behavior_events` | Raw behavioral signals from client |
| `behavior_features` | Aggregated behavior features (24h/7d) |
| `human_questions` | Seeded PHQ-style question bank |
| `human_answers` | User responses to questions |
| `notification_intents` | Queued in-app notification intents |

---

## Architecture notes

- **Host-agnostic**: swap `DATABASE_URL` for PostgreSQL (Supabase, Neon, RDS) with zero code changes
- **Auth modes**: `AUTH_MODE=jwt` (default/prod) or `AUTH_MODE=header` (dev testing via `X-User-Id` header)
- **Risk engines**: v2 (PHQ-9 + behavior) and v3 (wellness score) coexist — worker picks the best available
- **Behavioral data**: The server cannot access the user's device. A client (browser extension, desktop agent) must send events to `POST /ingest/behavior`. See `ARCHITECTURE.md`.
- **Deploy**: API → Render / Railway / Fly.io · Frontend → Vercel / Cloudflare Pages

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Python 3.14, FastAPI, SQLAlchemy, Pydantic v2, python-jose, passlib |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Axios |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (HS256), bcrypt password hashing |
