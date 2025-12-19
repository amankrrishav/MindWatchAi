🧠 MindWatch Backend

MindWatch is a clinically grounded, behavior-aware mental health monitoring backend that combines validated questionnaires (PHQ-9) with temporal intelligence to produce explainable, safety-first risk assessments over time.

This system is intentionally deterministic, auditable, and clinically sane —
not a black-box ML model and not a consumer wellness gimmick.

⸻

🚀 Core Capabilities

⸻

1️⃣ Clinical Signal Processing
	•	PHQ-9 ingestion and scoring
	•	Severity classification (low / medium / high)
	•	Suicide ideation detection (Q9 safety override)
	•	Session-aware assessments
	•	Historical PHQ-9 persistence

⸻

2️⃣ Behavioral Intelligence (Extensible Layer)
	•	Timestamped behavioral event ingestion
	•	Feature extraction pipeline:
	•	Activity volume
	•	Negativity ratio
	•	Volatility
	•	Behavior-aware risk amplification (Risk Engine v2)
	•	Designed for future passive signals:
	•	Sleep
	•	Mobility
	•	App usage
	•	Interaction cadence

⸻

3️⃣ Risk Engine (Versioned & Explainable)
	•	Risk Engine v1: PHQ-9 only (clinical baseline reference)
	•	Risk Engine v2: PHQ-9 + behavior features
	•	Deterministic scoring (no stochastic output)
	•	Fully explainable reasoning tree
	•	Confidence-aware outputs
	•	Safety-first escalation logic
	•	Explicit support for risk decay & recovery

⸻

4️⃣ Continuous Monitoring & Persistent Memory
	•	Persistent Monitoring State per user:
	•	Last risk level
	•	Last confidence
	•	High-risk streak counter
	•	Cooldown / recovery streak counter
	•	Trend streak counter
	•	Continuous background evaluation loop
	•	Restart-safe and idempotent
	•	No frontend polling required

⸻

5️⃣ Risk Trends & Early Intelligence (Phase 11B)
	•	Snapshot-based trend detection
	•	Detects:
	•	Accelerating risk
	•	Recovering risk
	•	Trend events stored separately from alerts
	•	Streak-based promotion to avoid noise
	•	Enables early clinical awareness without panic
	•	Designed for foresight, not reaction

⸻

6️⃣ Alerts & Safety Controls
	•	Alerts triggered only for HIGH risk
	•	Escalation requires consecutive confirmation
	•	24-hour alert deduplication window
	•	One active alert per user at a time
	•	Acknowledge / resolve lifecycle
	•	Recovery-aware suppression
	•	Designed to prevent alert fatigue and desensitization

⸻

7️⃣ Snapshot Memory & Noise Reduction (Phase 11B.4)
	•	Risk snapshots persisted as time-series memory
	•	Duplicate snapshot prevention
	•	Confidence-delta filtering
	•	Engine-version guard
	•	Time-based compression
	•	Prevents database pollution
	•	Produces clean, meaningful timelines for UI & audits

⸻

8️⃣ Automation & Background Workers
	•	Continuous monitoring worker
	•	Daily auto-snapshot worker
	•	Fully async, FastAPI-native
	•	Non-blocking and production-safe
	•	User-level failure isolation
	•	Graceful shutdown support (SIGINT / SIGTERM)
	•	Restart-safe execution

⸻

9️⃣ System Health & Reliability (Phase 13)
	•	Worker heartbeat mechanism
	•	Health endpoint (/health) exposing:
	•	System status (ok / degraded / starting)
	•	Worker liveness
	•	Last heartbeat timestamp
	•	Safe restarts without false alerts or trends
	•	Operational visibility for deployment & SRE use


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
├── last_risk
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
Risk Alerts
├── HIGH risk only
├── Deduplicated
│
▼
Risk Snapshots (Noise-reduced)
│
▼
Timeline / Trends / Audit APIs
│
▼
Frontend Intelligence UI