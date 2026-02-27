# MindWatch API

This is the FastAPI backend I built for MindWatch—my clinically grounded mental health monitoring system.

## Overview
It handles everything from JWT-based authentication to managing 7-signal wellness check-ins, scaling up to PHQ-9 analysis, and executing background workers that continuously monitor behavioral risk.

## Quick Start

```bash
# 1. Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies (Requires Python 3.14)
pip install -r requirements.txt
pip install "bcrypt==4.0.1"

# 3. Boot the server
uvicorn app.main:app --reload --port 8000
```
- API is exposed at `http://127.0.0.1:8000`
- Interactive OpenAPI docs available at `http://127.0.0.1:8000/docs`

## Background Workers
I built this backend with three main asynchronous workers running via Starlette threadpools to keep the event loop unblocked:
1. **Monitoring Worker** (runs every 5m): Assesses risk profiles and creates alerts.
2. **Orchestration Worker** (runs every 10m): Queues up questions based on device health and confidence.
3. **Snapshot Worker** (runs every 24h): Saves a daily point-in-time risk overview.

## Database & Models
I'm using SQLAlchemy. It defaults to an SQLite file (`mindwatch.db`) for development but connects to PostgreSQL for production just by changing `DATABASE_URL` in the `.env` file.

*Refer to the main repository `README.md` for full architecture notes.*
