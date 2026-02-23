export function translateReasons(reasons: string[] = [], confidence = 1.0): string[] {
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
