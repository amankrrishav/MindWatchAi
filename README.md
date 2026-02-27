# MindWatch 🧠

Hey there, I built **MindWatch** to provide clinically grounded mental health monitoring right from your browser. 

This project fuses standardized psychological assessments (like the PHQ-9) with daily 7-signal wellness check-ins. It's designed to give a deterministic risk assessment, orchestrated check-ins, and safety-first alerts while ensuring the user remains in complete control of their data.

---

## 🏗 System Architecture

I've structured this as a decoupled monolith. 

```text
MindWatchAi/
├── mindwatch-api/      # FastAPI Python Backend
└── mindwatch-web/      # React + TypeScript Frontend
```

### The Backend (`mindwatch-api`)
The backend is built in **Python 3.14** using **FastAPI** and **SQLAlchemy**. It's completely host-agnostic—you can swap the `DATABASE_URL` from SQLite for local development to PostgreSQL (like Supabase or Neon) for production without changing a single line of application code.

It runs three isolated background threads using `starlette.concurrency`:
1. **Monitoring Worker (5 min):** Scans the database to compute risk scores, detect long-term behavioral trends, and escalate alerts.
2. **Orchestration Worker (10 min):** Dynamically decides when to surface new assessment questions so users aren't overwhelmed.
3. **Daily Snapshot Worker (24 hr):** Safely persists a hard risk snapshot for every active user.

**A note on behavioral data:** The monitoring engine relies on behavioral signals (typing cadence, app shifts, idle time) sent to `POST /ingest/behavior`. *The server does not natively scrape your computer.* You will need to attach a client (a browser extension or desktop agent) to push these signals actively. 

### The Frontend (`mindwatch-web`)
The web client is built with **React 18**, **TypeScript**, and styled using **Tailwind CSS**. It provides the core visual interface where users can authenticate, submit their wellness check-ins, observe their risk snapshots via interactive charts, and manage their privacy consent toggles.

---

## 🚀 Quick Start Guide

You'll need two separate terminal instances to spin up the local development environment.

### 1. Boot up the Backend

```bash
cd mindwatch-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install "bcrypt==4.0.1"   # required for Python 3.14 compatibility
uvicorn app.main:app --reload --port 8000
```
- The API will be live at: `http://127.0.0.1:8000`
- API documentation (Swagger): `http://127.0.0.1:8000/docs`

### 2. Boot up the Frontend

Open a new terminal tab/window:

```bash
cd mindwatch-web
npm install
npm run dev
```
- The Dashboard will be live at: `http://localhost:5173`

### 3. Your First Run
1. Navigate to the web app (`http://localhost:5173`).
2. Register a new account.
3. Complete your first 7-signal wellness check-in.
4. From there, the background workers will automatically begin monitoring and generating your risk profile.

---

## ⚙️ Configuration (.env)

If you are running this locally, you can copy the `.env.example` configurations.

### `mindwatch-api/.env`
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

### `mindwatch-web/.env`
```env
VITE_API_URL=http://127.0.0.1:8000
```

---

*Maintained and developed independently as an exploration into privacy-first mental health tech.*
