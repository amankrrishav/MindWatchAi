from typing import Optional


def decide_ask_or_not(
    confidence_score: float,
    uncertainty_reason: Optional[str],
) -> dict:
    if confidence_score < 0.6:
        return {"decision": "ask", "explanation": "Low confidence in current assessment"}
    if uncertainty_reason is not None:
        return {"decision": "ask", "explanation": f"Uncertainty: {uncertainty_reason}"}
    return {"decision": "dont_ask", "explanation": "Sufficient confidence, no uncertainty"}
