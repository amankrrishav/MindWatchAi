"""PHQ-9 scoring logic. Deterministic, clinically grounded."""


def calculate_phq9_score(answers: dict[str, int]) -> dict:
    """
    Map PHQ-9 answers to total score and severity.
    Standard PHQ-9: 0–3 per item, total 0–27.
    """
    total = sum(answers.values())

    if total <= 4:
        severity = "minimal"
    elif total <= 9:
        severity = "mild"
    elif total <= 14:
        severity = "moderate"
    elif total <= 19:
        severity = "moderately_severe"
    else:
        severity = "severe"

    suicide_risk = answers.get("q9", 0) > 0

    return {
        "total_score": total,
        "severity": severity,
        "suicide_risk": suicide_risk,
    }
