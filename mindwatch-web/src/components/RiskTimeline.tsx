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
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Risk Timeline</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v) => (v === 1 ? "Low" : v === 2 ? "Medium" : "High")} />
          <Tooltip formatter={(_, __, props) => props.payload?.riskLabel?.toUpperCase()} />
          <Line type="monotone" dataKey="riskValue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          {matchedTrends.map((trend, idx) => (
            <ReferenceDot
              key={idx}
              x={trend.time}
              y={trend.riskValue}
              r={6}
              fill={trend.direction === "up" ? "#f59e0b" : "#10b981"}
              label={{ position: "top", value: trend.direction === "up" ? "▲" : "▼", fill: trend.direction === "up" ? "#f59e0b" : "#10b981", fontSize: 14 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {snapshots.length > 1 && <RiskRecoveryInsight snapshots={snapshots} />}
      {snapshots.length <= 1 && (
        <p className="flex items-center gap-2 text-sm text-gray-500 mt-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Risk levels over time are shown for context alongside confidence changes.
        </p>
      )}
    </div>
  );
}
