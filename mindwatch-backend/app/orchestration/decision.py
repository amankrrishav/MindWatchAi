from typing import Optional, Dict


def decide_ask_or_not(
    confidence_score: float,
    uncertainty_reason: Optional[str],
) -> Dict[str, str]:

    if confidence_score < 0.6:
        return {
            "decision": "ask",
            "explanation": "Low confidence in current assessment"
        }

    if uncertainty_reason is not None:
        return {
            "decision": "ask",
            "explanation": f"Uncertainty detected: {uncertainty_reason}"
        }

    return {
        "decision": "dont_ask",
        "explanation": "Sufficient confidence and no uncertainty"
    }