🧠 MindWatch Backend

MindWatch is a clinically grounded, behavior-aware mental health monitoring backend that combines validated questionnaires (PHQ-9) with temporal intelligence to produce explainable, safety-first risk assessments over time.

This system is intentionally deterministic, auditable, and clinically sane —
not a black-box ML model and not a consumer wellness gimmick.

⸻

🚀 Core Capabilities

1️⃣ Clinical Signal Processing
	•	PHQ-9 ingestion and scoring
	•	Severity classification (low / medium / high)
	•	Suicide ideation detection (Q9 safety override)
	•	Session-aware assessments

⸻

2️⃣ Behavioral Intelligence (Extensible Layer)
	•	Timestamped behavior event ingestion
	•	Feature extraction pipeline:
	•	Activity volume
	•	Negativity ratio
	•	Volatility
	•	Behavior-aware risk amplification (v2 engine)
	•	Designed for future passive signals (sleep, mobility, app usage)

⸻

3️⃣ Risk Engine (Versioned & Explainable)
	•	Risk Engine v1: PHQ-9 only (baseline, clinical reference)
	•	Risk Engine v2: PHQ-9 + behavior features
	•	Deterministic scoring
	•	Fully explainable reasoning tree
	•	Safety-first escalation logic

⸻

4️⃣ Continuous Monitoring & Memory
	•	Persistent Monitoring State per user:
	•	Last risk
	•	Confidence
	•	High-risk streaks
	•	Cooldown streaks
	•	Continuous background evaluation loop
	•	No polling from frontend required

⸻

5️⃣ Risk Trends & Early Intelligence (Phase 11B)
	•	Snapshot-based trend detection
	•	Detects:
	•	Accelerating risk
	•	Recovering risk
	•	Trend events persisted separately from alerts
	•	Early warning signals without panic
	•	Enables clinician foresight, not reactive alarms

⸻

6️⃣ Alerts & Safety Controls
	•	Alerts only triggered for HIGH risk
	•	Escalation requires consecutive confirmation
	•	24-hour alert deduplication window
	•	Recovery-aware suppression
	•	Designed to prevent alert fatigue

⸻

7️⃣ Snapshot Memory & Noise Reduction (Phase 11B.4)
	•	Risk snapshots persisted as time-series memory
	•	Duplicate snapshot prevention
	•	Confidence-based filtering
	•	Prevents database pollution
	•	Produces clean, meaningful timelines for UI

⸻

8️⃣ Automation
	•	Daily automatic snapshot worker
	•	Continuous monitoring worker
	•	Fully async, FastAPI-native
	•	Non-blocking and production-safe





🏗️ System Architecture (Current)

Raw Inputs
├── PHQ-9 Questionnaire
├── Behavioral Events
│
▼
Data Persistence
├── phq9_labels
├── behavior_events
│
▼
Feature Extraction
├── behavior_features
│
▼
Risk Engine (Versioned)
├── Risk Engine v1 (clinical baseline)
├── Risk Engine v2 (behavior-aware)
│
▼
Monitoring State (Persistent Memory)
├── high_streak
├── cooldown_streak
├── trend_streak
│
▼
Risk Trend Detection
├── accelerating_risk
├── recovering_risk
│
▼
Risk Alerts (HIGH only, deduplicated)
│
▼
Risk Snapshots (Noise-reduced)
│
▼
Timeline / Trends / Audit APIs
│
▼
Frontend Intelligence UI (Phase 12)
