STANDARD_ANSWERS = [
    {"key": "not_at_all", "label": "Not at all"},
    {"key": "sometimes", "label": "Several days"},
    {"key": "often", "label": "More than half the days"},
    {"key": "almost_always", "label": "Nearly every day"},
]


def build_question_card(question_id: str, question_text: str, max_answers: int = 4) -> dict:
    return {
        "id": question_id,
        "title": "Quick check-in",
        "question": question_text,
        "answers": STANDARD_ANSWERS[:max_answers],
        "allow_skip": True,
    }
