🧠 MindWatch Backend

MindWatch is a clinically grounded, behavior-aware mental health monitoring backend that combines validated psychiatric questionnaires (PHQ-9) with temporal intelligence to produce explainable, safety-first risk assessments over time.

This system is intentionally deterministic, auditable, and clinically sane —
not a black-box ML model and not a consumer wellness gimmick.

MindWatch is built as a long-running monitoring system, not a one-time assessment tool.

⸻

🚀 Core Capabilities (Locked at Phase 16.1.1)

⸻

1️⃣ Clinical Signal Processing
	•	PHQ-9 ingestion, validation, and scoring
	•	Severity classification: low / medium / high
	•	Suicide ideation detection via Q9 hard override
	•	Session-safe assessment handling
	•	Historical PHQ-9 persistence
	•	Audit-grade answer storage and traceability

⸻

2️⃣ Behavioral Intelligence (Extensible Layer)
	•	Timestamped behavioral event ingestion
	•	Feature extraction:
	•	Activity volume
	•	Negativity ratio
	•	Behavioral volatility
	•	Behavior-aware risk amplification (Risk Engine v2)
	•	Designed for future passive signals:
	•	Sleep
	•	Mobility
	•	App usage
	•	Interaction cadence

⸻

3️⃣ Risk Engine (Versioned & Explainable)
	•	Risk Engine v1 — PHQ-9 only (clinical baseline)
	•	Risk Engine v2 — PHQ-9 + behavioral features
	•	Fully deterministic scoring
	•	Explainable reasoning tree
	•	Confidence-aware outputs
	•	Safety-first escalation logic
	•	Explicit support for risk decay and recovery

⸻

4️⃣ Continuous Monitoring & Persistent Memory
	•	Persistent per-user monitoring state:
	•	Last risk level
	•	Last confidence score
	•	High-risk streak counter
	•	Cooldown / recovery streak
	•	Trend streak
	•	Continuous background evaluation loop
	•	Restart-safe and idempotent
	•	No frontend polling required
	•	Designed for longitudinal monitoring

⸻

5️⃣ Risk Trends & Early Intelligence (Phase 11B)
	•	Snapshot-based trend detection
	•	Detects accelerating and recovering risk
	•	Trends stored separately from alerts
	•	Streak-based promotion to suppress noise
	•	Enables early awareness without panic

⸻

6️⃣ Alerts & Safety Controls
	•	Alerts triggered only for HIGH risk
	•	Consecutive confirmation required
	•	24-hour deduplication window
	•	One active alert per user
	•	Full acknowledge / resolve lifecycle
	•	Recovery-aware suppression
	•	Designed to prevent alert fatigue

⸻

7️⃣ Snapshot Memory & Noise Reduction (Phase 11B.4)
	•	Risk snapshots stored as clean time-series memory
	•	Duplicate snapshot prevention
	•	Confidence-delta filtering
	•	Engine-version guards
	•	Time-based compression
	•	Clean timelines for UI, analytics, and audits

⸻

8️⃣ Automation & Background Workers
	•	Continuous monitoring worker
	•	Daily auto-snapshot worker
	•	Fully async, FastAPI-native
	•	User-level failure isolation
	•	Graceful shutdown (SIGINT / SIGTERM)
	•	Restart-safe execution

⸻

9️⃣ System Health & Reliability (Phase 13)
	•	Worker heartbeat mechanism
	•	/health endpoint exposing:
	•	System status (ok / degraded / starting)
	•	Worker liveness
	•	Last heartbeat timestamp
	•	Safe restarts without false alerts or trends

⸻

🔐 Determinism & Safety Lock (Phase 16.1.1)
	•	Single-fire alert guarantees
	•	Trend de-duplication
	•	Snapshot idempotency
	•	Engine-version immutability
	•	Restart immunity
	•	Explicit uncertainty handling
	•	Same input + same state = same output

⸻

🧠 Human Question Interface (Foundational)
	•	Orchestration-driven questioning
	•	Deterministic question sequencing
	•	One question → one action guarantee
	•	Answer & skip flows are audit-safe
	•	PHQ answer → score mapping persisted
	•	Silent-by-default UX philosophy


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