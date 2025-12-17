export function explainReason(reason) {
  const map = {
    phq9_mild:
      "Recent PHQ-9 responses indicate mild depressive symptoms.",

    phq9_moderate:
      "PHQ-9 scores suggest moderate depressive symptoms.",

    phq9_severe:
      "PHQ-9 scores indicate severe depressive symptoms requiring attention.",

    suicide_risk_flag:
      "Recent responses indicate thoughts related to self-harm or suicide.",

    behavior_pattern_detected:
      "Behavioral patterns show increased instability or irregular activity.",

    high_negative_behavior:
      "A high proportion of recent behavioral signals show negative sentiment.",

    behavior_volatility:
      "Recent behavior shows frequent fluctuations, suggesting emotional volatility.",

    activity_spike:
      "A sudden increase in activity was detected compared to recent baseline.",
  };

  return map[reason] || "An unspecified risk factor was detected.";
}