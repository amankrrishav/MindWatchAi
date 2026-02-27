# MindWatch Architecture

Here's an overview of how I structured the MindWatch monitoring engine and how clients should interact with it.

## Monitoring Worker: What It Does and Doesn't Do

### What it CAN do (Server-Side)

I built the monitoring worker to run **only on the server**. Every 5 minutes it does the following:

1. Fetches all users who have PHQ-9 or Wellness Check-in data stored in my database.
2. For each user, **reads** from the database:
   - `PHQ9Analysis` — Depression scores from assessments.
   - `BehaviorFeature` — Aggregated behavioral metrics (if any exist).
3. Computes the risk (v2 engine for behavior/PHQ9, v3 engine for wellness signals) and detects trends.
4. Creates point-in-time risk snapshots when thresholds are hit.
5. Escalates alerts when HIGH risk is sustained (2 consecutive cycles).
6. Stores trend events (e.g., accelerating deterioration / recovering).

**The worker does NOT:**
- Access the user's computer, keyboard, or screen.
- See typing patterns, screen time, or app usage directly.
- "Pull" any data from the user's system autonomously.

### How Behavioral Data Gets Into My System

My backend relies on behavioral data (typing patterns, screen time, activity) being **collected by a client** and **sent into the API**. 

```text
User's device (browser / desktop app / mobile app)
    │
    │  Client collects: typing cadence, idle time, app switches, etc.
    │
    ▼
POST /ingest/behavior
    {
      "user_id": "...",
      "timestamp": "2025-02-23T12:00:00Z",
      "features": {
        "sentiment": -0.3,           // optional, from text analysis
        "active_minutes": 45,        // custom
        "keystroke_volatility": 0.2  // custom
      }
    }
    │
    ▼
Database: behavior_events → behavior_feature_service extracts → behavior_features
    │
    ▼
Risk Engine v2 uses behavior_features when computing risk
```

**What I need to build next for real behavioral monitoring:**
1. **Browser extension** — Tracks time on tab, typing pauses, possibly sentiment from typed text (with explicit user consent).
2. **Desktop app** (Electron/Tauri) — Can track app usage, idle time, and screen time at the OS level.
3. **Mobile app** — Can use device APIs for usage patterns (with iOS/Android permissions).

All of these clients would **POST to `/ingest/behavior`** periodically. My monitoring worker then processes whatever behavior events are already ingested in the database.

### Summary

| Component | Location | Role |
|-----------|----------|------|
| Monitoring worker | Server | Processes DB data, computes risk, creates snapshots/alerts |
| Orchestration worker | Server | Decides when to ask questions, writes OrchestrationDecision |
| Daily snapshot worker | Server | Stores 24h risk snapshots for all users securely |
| `/ingest/behavior` | API | Receives behavioral events offloaded from clients |
| Client | User's device | Collects and sends behavioral data — **not yet implemented** |
