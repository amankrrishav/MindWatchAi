from typing import List, Dict, Optional

UNCERTAINTY_TO_KEY = {
    "stale_data": "mood",
    "inconsistent_signals": "anhedonia",
    "low_signal_volume": "sleep",
    "device_unhealthy": "sleep",
    "no_recent_data": "mood",
}


def select_questions(
    decision: str,
    uncertainty_reason: Optional[str],
    questions: List[Dict],
    max_questions: int = 1,
):
    """Select questions for orchestration. questions: [{clinical_key, question_text, risk_level}]"""
    if decision != "ask":
        return []
    if uncertainty_reason in UNCERTAINTY_TO_KEY:
        target = UNCERTAINTY_TO_KEY[uncertainty_reason]
        for q in questions:
            if q.get("clinical_key") == target:
                return [q]
    sorted_qs = sorted(
        questions,
        key=lambda q: ("low", "medium", "high").index(q.get("risk_level", "low")),
    )
    return sorted_qs[:max_questions]
