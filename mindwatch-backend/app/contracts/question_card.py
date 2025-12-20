from typing import List, Dict


STANDARD_ANSWERS = [
    {"key": "not_at_all", "label": "Not really"},
    {"key": "sometimes", "label": "Sometimes"},
    {"key": "often", "label": "Often"},
    {"key": "almost_always", "label": "Almost always"},
]


def build_question_card(
    question_id: str,
    question_text: str,
    max_answers: int = 3,
) -> Dict:
    """
    Returns a question card contract to be consumed by clients.
    """

    return {
        "id": question_id,
        "title": "Quick check-in",
        "question": question_text,
        "answers": STANDARD_ANSWERS[:max_answers],
        "allow_skip": True,
    }