const riskRank: Record<string, number> = { low: 1, medium: 2, high: 3 };

export function analyzeRiskDecay(snapshots: { risk_level: string; confidence: number }[]) {
  if (!snapshots || snapshots.length < 2) return null;
  const latest = snapshots[0];
  const previous = snapshots[1];
  const latestRank = riskRank[latest.risk_level] ?? 1;
  const previousRank = riskRank[previous.risk_level] ?? 1;
  if (latestRank < previousRank) {
    return { type: "improved", message: `Risk decreased from ${previous.risk_level.toUpperCase()} to ${latest.risk_level.toUpperCase()}, indicating recovery.` };
  }
  if (latestRank > previousRank) {
    return { type: "worsened", message: `Risk increased from ${previous.risk_level.toUpperCase()} to ${latest.risk_level.toUpperCase()}.` };
  }
  if (latest.confidence < previous.confidence) {
    return { type: "stabilizing", message: "Risk level remained stable while confidence decreased, suggesting stabilization." };
  }
  return null;
}
