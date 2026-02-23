from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

REASON_EXPLANATIONS: dict[str, str] = {
    "phq9_mild": "PHQ-9 results indicate mild depressive symptoms.",
    "phq9_moderate": "PHQ-9 results indicate moderate depressive symptoms.",
    "phq9_moderately_severe": "PHQ-9 results indicate moderately severe depressive symptoms.",
    "phq9_severe": "PHQ-9 results indicate severe depressive symptoms.",
    "suicide_risk_flag": (
        "A suicide risk indicator was triggered based on recent assessment responses."
    ),
    "behavior_volatility": "User behavior shows high volatility, suggesting emotional instability.",
    "behavior_pattern_detected": "Behavioral patterns indicate sustained changes.",
    "high_negative_behavior": "Recent behavioral data contains a high proportion of negative indicators.",
    "activity_spike": "A sudden increase in behavioral activity was detected.",
    "no_behavior_features": "Behavioral data is currently insufficient for trend analysis.",
    "no_phq9_data": "No recent PHQ-9 assessment data is available.",
}

REASON_PRIORITY = [
    "suicide_risk_flag",
    "phq9_severe",
    "phq9_moderately_severe",
    "phq9_moderate",
    "phq9_mild",
    "behavior_volatility",
    "behavior_pattern_detected",
    "high_negative_behavior",
    "activity_spike",
]

TONE_BY_RISK = {"low": "reassuring", "medium": "cautionary", "high": "urgent", "unknown": "neutral"}


def build_explanation(risk_level: str, confidence: float, reasons: list[str]) -> dict:
    sorted_reasons = sorted(
        reasons,
        key=lambda r: REASON_PRIORITY.index(r) if r in REASON_PRIORITY else 999,
    )
    details = [
        REASON_EXPLANATIONS.get(r, f"Unrecognized risk factor: {r}.")
        for r in sorted_reasons
    ]
    if risk_level == "high":
        summary = "Risk level is high. Immediate attention and further assessment are recommended."
    elif risk_level == "medium":
        summary = "Risk level is moderate. Monitor and address proactively."
    elif risk_level == "low":
        summary = "Risk level is low. Current indicators suggest stability."
    else:
        summary = "Risk level could not be determined due to insufficient data."

    return {
        "risk_level": risk_level,
        "confidence": confidence,
        "tone": TONE_BY_RISK.get(risk_level, "neutral"),
        "summary": summary,
        "details": details,
    }
