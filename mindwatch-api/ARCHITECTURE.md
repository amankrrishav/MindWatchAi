# MindWatch Architecture

## Monitoring Worker: What It Does and Doesn't Do

### What the monitoring worker CAN do (server-side)

The monitoring worker runs **only on the server**. Every 5 minutes it:

1. Fetches all users who have PHQ-9 data in the database
2. For each user, **reads** from the database:
   - `PHQ9Analysis` — depression scores from assessments
   - `BehaviorFeature` — aggregated behavioral metrics (if any exist)
3. Computes risk (v2 engine) and detects trends
4. Creates risk snapshots when thresholds are hit
5. Creates alerts when HIGH risk is sustained (2 consecutive cycles)
6. Stores trend events (accelerating / recovering)

**The worker does NOT:**
- Access the user's computer, keyboard, or screen
- See typing patterns, screen time, or app usage directly
- "Pull" any data from the user's system

### How behavioral data gets into the system

Behavioral data (typing patterns, screen time, activity) must be **collected by a client** and **sent to the API**:

```
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

**What you need to add for real behavioral monitoring:**

1. **Browser extension** — Tracks time on tab, typing pauses, possibly sentiment from typed text (with consent)
2. **Desktop app** (Electron/Tauri) — Can track app usage, idle time, screen time
3. **Mobile app** — Can use device APIs for usage patterns (with permissions)

All of these would **POST to `/ingest/behavior`** periodically. The monitoring worker then processes whatever is already in the database.

### Summary

| Component | Location | Role |
|-----------|----------|------|
| Monitoring worker | Server | Processes DB data, computes risk, creates snapshots/alerts |
| Orchestration worker | Server | Decides when to ask questions, writes OrchestrationDecision |
| Daily snapshot worker | Server | Stores 24h risk snapshots for all users |
| `/ingest/behavior` | API | Receives behavioral events from clients |
| Client (extension/app) | User's device | Collects and sends behavioral data — **not yet implemented** |
