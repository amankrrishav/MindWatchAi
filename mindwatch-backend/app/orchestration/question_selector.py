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
) -> List[Dict]:
    """
    questions: list of dicts with keys:
      - clinical_key
      - question_text
      - risk_level
    """

    if decision != "ask":
        return []

    # 1. Try uncertainty-driven question
    if uncertainty_reason in UNCERTAINTY_TO_KEY:
        target_key = UNCERTAINTY_TO_KEY[uncertainty_reason]
        for q in questions:
            if q["clinical_key"] == target_key:
                return [q]

    # 2. Fallback: lowest risk question
    sorted_qs = sorted(
        questions,
        key=lambda q: ("low", "medium", "high").index(q["risk_level"])
    )

    return sorted_qs[:max_questions]