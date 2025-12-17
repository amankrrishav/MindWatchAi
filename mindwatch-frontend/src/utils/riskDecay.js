const riskRank = {
  low: 1,
  medium: 2,
  high: 3,
};

export function analyzeRiskDecay(snapshots) {
  if (!snapshots || snapshots.length < 2) return null;

  // snapshots are newest → oldest
  const latest = snapshots[0];
  const previous = snapshots[1];

  const latestRank = riskRank[latest.risk_level];
  const previousRank = riskRank[previous.risk_level];

  if (latestRank < previousRank) {
    return {
      type: "improved",
      message: `Risk decreased from ${previous.risk_level.toUpperCase()} to ${latest.risk_level.toUpperCase()}, indicating recovery signals.`,
    };
  }

  if (latestRank > previousRank) {
    return {
      type: "worsened",
      message: `Risk increased from ${previous.risk_level.toUpperCase()} to ${latest.risk_level.toUpperCase()}.`,
    };
  }

  if (latest.confidence < previous.confidence) {
    return {
      type: "stabilizing",
      message: "Risk level remained stable while confidence decreased, suggesting stabilization.",
    };
  }

  return null;
}