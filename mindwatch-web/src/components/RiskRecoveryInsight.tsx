import { analyzeRiskDecay } from "../utils/riskDecay";

interface Snapshot {
  risk_level: string;
  confidence: number;
}

export default function RiskRecoveryInsight({ snapshots }: { snapshots: Snapshot[] }) {
  const insight = analyzeRiskDecay(snapshots);
  if (!insight) return null;
  const colorClass = insight.type === "improved" ? "text-green-700" : insight.type === "worsened" ? "text-red-700" : "text-blue-700";
  const icon = insight.type === "improved" ? "🟢 " : insight.type === "worsened" ? "🔴 " : "🔵 ";
  return (
    <div className={`mt-3 text-sm font-medium ${colorClass}`}>
      {icon}
      {insight.message}
    </div>
  );
}
