import { analyzeRiskDecay } from "../utils/riskDecay";

function RiskRecoveryInsight({ snapshots }) {
  const insight = analyzeRiskDecay(snapshots);

  if (!insight) return null;

  const color =
    insight.type === "improved"
      ? "green"
      : insight.type === "worsened"
      ? "red"
      : "blue";

  return (
    <div
      className={`mt-3 text-sm font-medium text-${color}-700`}
    >
      {insight.type === "improved" && "🟢 "}
      {insight.type === "worsened" && "🔴 "}
      {insight.type === "stabilizing" && "🔵 "}
      {insight.message}
    </div>
  );
}

export default RiskRecoveryInsight;