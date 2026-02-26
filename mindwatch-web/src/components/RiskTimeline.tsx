import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import RiskRecoveryInsight from "./RiskRecoveryInsight";

function mapRiskLevel(level: string) {
  if (level === "low") return 1;
  if (level === "medium") return 2;
  if (level === "high") return 3;
  return 0;
}

interface Snapshot {
  created_at: string;
  risk_level: string;
  confidence: number;
}

interface Trend {
  created_at: string;
  direction: string;
  severity: string;
  reason: string;
}

export default function RiskTimeline({ snapshots, trends = [] }: { snapshots: Snapshot[]; trends?: Trend[] }) {
  const data = snapshots.map((s) => ({
    time: new Date(s.created_at).toLocaleDateString(),
    timestamp: new Date(s.created_at).getTime(),
    riskValue: mapRiskLevel(s.risk_level),
    riskLabel: s.risk_level,
  }));
  const trendPoints = trends.map((t) => ({
    ...t,
    timestamp: new Date(t.created_at).getTime(),
  }));
  const matchedTrends = trendPoints.map((trend) => {
    const closest = data.reduce((prev, curr) =>
      Math.abs(curr.timestamp - trend.timestamp) < Math.abs(prev.timestamp - trend.timestamp) ? curr : prev
    );
    return { ...trend, time: closest.time, riskValue: closest.riskValue };
  });

  return (
    <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
      <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Risk Timeline</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v) => (v === 1 ? "Low" : v === 2 ? "Medium" : "High")} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip
            formatter={(_, __, props) => props.payload?.riskLabel?.toUpperCase()}
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.5rem' }}
          />
          <Line type="monotone" dataKey="riskValue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#818cf8', stroke: '#111827', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#6366f1', stroke: '#c7d2fe' }} />
          {matchedTrends.map((trend, idx) => (
            <ReferenceDot
              key={idx}
              x={trend.time}
              y={trend.riskValue}
              r={6}
              fill={trend.direction === "up" ? "#f59e0b" : "#10b981"}
              stroke="#111827"
              strokeWidth={2}
              label={{ position: "top", value: trend.direction === "up" ? "▲" : "▼", fill: trend.direction === "up" ? "#fbbf24" : "#34d399", fontSize: 14 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {snapshots.length > 1 && <RiskRecoveryInsight snapshots={snapshots} />}
      {snapshots.length <= 1 && (
        <p className="flex items-center gap-2 text-sm text-gray-400 mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
          <span className="w-2.5 h-2.5 rounded-full bg-pro-accent inline-block" />
          Risk levels over time are shown for context alongside confidence changes.
        </p>
      )}
    </div>
  );
}
