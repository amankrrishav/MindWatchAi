import { analyzeRiskDecay } from "../utils/riskDecay";

interface Snapshot {
  risk_level: string;
  confidence: number;
}

export default function RiskRecoveryInsight({ snapshots }: { snapshots: Snapshot[] }) {
  const insight = analyzeRiskDecay(snapshots);
  if (!insight) return null;
  const colorClass = insight.type === "improved" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : insight.type === "worsened" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-blue-400 bg-blue-500/10 border-blue-500/20";
  const icon = insight.type === "improved" ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
  ) : insight.type === "worsened" ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  );
  return (
    <div className={`mt-4 px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${colorClass} transition-colors font-sans`}>
      {icon}
      <span>{insight.message}</span>
    </div>
  );
}
