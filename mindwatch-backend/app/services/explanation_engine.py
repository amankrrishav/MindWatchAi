from typing import List, Dict


# -------------------------------
# Reason → Clinician Explanation Map
# -------------------------------

REASON_EXPLANATIONS = {
    # PHQ-9
    "phq9_mild": "PHQ-9 results indicate mild depressive symptoms.",
    "phq9_moderate": "PHQ-9 results indicate moderate depressive symptoms.",
    "phq9_moderately_severe": "PHQ-9 results indicate moderately severe depressive symptoms.",
    "phq9_severe": "PHQ-9 results indicate severe depressive symptoms.",

    # Suicide risk
    "suicide_risk_flag": (
        "A suicide risk indicator was triggered based on recent assessment responses, "
        "suggesting elevated self-harm risk."
    ),

    # Behavioral signals
    "behavior_volatility": (
        "User behavior shows high volatility, suggesting emotional or activity instability."
    ),
    "behavior_pattern_detected": (
        "Behavioral patterns over time indicate sustained changes that may reflect "
        "increased psychological stress."
    ),
    "high_negative_behavior": (
        "Recent behavioral data contains a high proportion of negative indicators."
    ),
    "activity_spike": (
        "A sudden increase in behavioral activity was detected, which may indicate distress."
    ),

    # Data gaps
    "no_behavior_features": (
        "Behavioral data is currently insufficient for reliable trend analysis."
    ),
    "no_phq9_data": (
        "No recent PHQ-9 assessment data is available to evaluate depressive symptoms."
    ),
}


# -------------------------------
# Reason Priority (Clinical Order)
# -------------------------------

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


# -------------------------------
# Tone by Risk Level
# -------------------------------

TONE_BY_RISK = {
    "low": "reassuring",
    "medium": "cautionary",
    "high": "urgent",
    "unknown": "neutral",
}


# -------------------------------
# Explanation Builder
# -------------------------------

def build_explanation(
    risk_level: str,
    confidence: float,
    reasons: List[str],
) -> Dict:
    """
    Convert risk engine output into clinician-grade explanations.
    Deterministic, auditable, and severity-aware.
    """

    # Sort reasons by clinical importance
    sorted_reasons = sorted(
        reasons,
        key=lambda r: REASON_PRIORITY.index(r)
        if r in REASON_PRIORITY else 999
    )

    # Build detailed explanation points
    detailed_points = [
        REASON_EXPLANATIONS.get(
            r, f"Unrecognized risk factor detected: {r}."
        )
        for r in sorted_reasons
    ]

    # Severity-aware summary
    if risk_level == "high":
        summary = (
            "Risk level is high due to significant clinical and behavioral indicators. "
            "Immediate attention and further assessment are strongly recommended."
        )
    elif risk_level == "medium":
        summary = (
            "Risk level is moderate, indicating emerging concerns that should be "
            "monitored and addressed proactively."
        )
    elif risk_level == "low":
        summary = (
            "Risk level is low, with current indicators suggesting stability."
        )
    else:
        summary = (
            "Risk level could not be confidently determined due to insufficient data."
        )

    return {
        "risk_level": risk_level,
        "confidence": confidence,
        "tone": TONE_BY_RISK.get(risk_level, "neutral"),
        "summary": summary,
        "details": detailed_points,
    }