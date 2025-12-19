const REASON_MAP = {
  phq9_severe:
    "PHQ-9 responses indicate severe depressive symptoms requiring attention.",

  phq9_moderately_severe:
    "PHQ-9 responses suggest moderately severe depressive symptoms.",

  suicide_risk_flag:
    "Recent responses include thoughts related to self-harm or suicide.",

  no_behavior_features:
    "No stabilizing behavioral patterns were detected during this period.",

  behavior_volatility:
    "Behavioral patterns show increased volatility.",

  confidence_spike:
    "Overall risk confidence increased significantly over a short period.",
};

export function translateReasons(reasons = [], confidence = 1.0) {
  const base = confidence < 0.85 ? "suggest" : "indicate";

  return reasons.map((reason) => {
    switch (reason) {
      case "phq9_severe":
        return `PHQ-9 responses ${base} severe depressive symptoms.`;

      case "phq9_moderately_severe":
        return `PHQ-9 responses ${base} moderately severe depressive symptoms.`;

      case "suicide_risk_flag":
        return `Responses ${base} elevated suicide-related risk.`;

      case "no_behavior_features":
        return `Recent activity patterns ${base} limited behavioral data.`;

      case "behavior_instability":
        return `Behavioral signals ${base} increased instability.`;

      default:
        return `An observed factor ${base} elevated risk.`;
    }
  });
}