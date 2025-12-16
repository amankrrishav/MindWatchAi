# 🧠 MindWatch Backend

MindWatch is a behavior-aware mental health monitoring backend that combines
clinical questionnaires (PHQ-9) with real-time behavioral signals to produce
explainable, safety-first risk assessments over time.

This backend is designed to be **deterministic, auditable, and clinically sane** —
not a black-box ML system.

---

## 🚀 Key Capabilities

### 1. Clinical Signal Processing
- PHQ-9 ingestion and analysis
- Severity classification
- Suicide ideation detection (Q9 safety override)

### 2. Behavioral Intelligence
- Raw behavior ingestion (timestamped events)
- Feature extraction (negativity, volatility, activity)
- Behavior-aware risk amplification

### 3. Risk Engine (Versioned)
- **Risk Engine v1**: PHQ-9 based baseline
- **Risk Engine v2**: PHQ-9 + behavior features
- Deterministic, explainable scoring
- Safety-first escalation rules

### 4. Risk Decay & Recovery
- Gradual risk reduction when behavior stabilizes
- Suicide ideation blocks decay
- Prevents permanent high-risk states

### 5. Alerts & Safety
- Alerts only on HIGH risk
- 24-hour de-duplication window
- Alert fatigue prevention
- Recovery-aware suppression

### 6. Historical Memory
- Risk snapshots persisted over time
- Manual and automated snapshot creation
- Enables timelines, trends, and audits

### 7. Automation
- Daily auto-snapshot background task
- Non-blocking, FastAPI-native implementation

---

## 🏗️ Architecture Overview
Raw Inputs
├── PHQ-9 Questionnaire
├── Behavior Events
↓
Data Persistence
├── phq9_labels
├── behavior_events
↓
Feature Extraction
├── behavior_features
↓
Risk Engines
├── Risk Engine v1
├── Risk Engine v2 (behavior-aware)
↓
Risk Decay / Recovery
↓
Alerts (deduplicated)
↓
Risk Snapshots (memory)
↓
Timeline & History APIs
