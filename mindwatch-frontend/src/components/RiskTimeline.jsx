import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

import RiskRecoveryInsight from "./RiskRecoveryInsight";

function mapRiskLevel(level) {
  if (level === "low") return 1;
  if (level === "medium") return 2;
  if (level === "high") return 3;
  return 0;
}

function RiskTimeline({ snapshots, trends = [] }) {
  // -------------------------------
  // Build timeline data
  // -------------------------------
  const data = snapshots.map((s) => ({
    time: new Date(s.created_at).toLocaleDateString(),
    timestamp: new Date(s.created_at).getTime(),
    riskValue: mapRiskLevel(s.risk_level),
    riskLabel: s.risk_level,
  }));

  // -------------------------------
  // Normalize trend points
  // -------------------------------
  const trendPoints = trends.map((t) => ({
    timestamp: new Date(t.created_at).getTime(),
    direction: t.direction, // up | down
    severity: t.severity,   // accelerating | recovering
    reason: t.reason,
  }));

  // -------------------------------
  // Match trend → closest snapshot
  // -------------------------------
  const matchedTrends = trendPoints.map((trend) => {
    const closest = data.reduce((prev, curr) =>
      Math.abs(curr.timestamp - trend.timestamp) <
      Math.abs(prev.timestamp - trend.timestamp)
        ? curr
        : prev
    );

    return {
      ...trend,
      time: closest.time,
      riskValue: closest.riskValue,
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Risk Timeline</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" />

          <YAxis
            domain={[0, 3]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) =>
              v === 1 ? "Low" : v === 2 ? "Medium" : "High"
            }
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />

          <Tooltip
            formatter={(value, name, props) =>
              props.payload?.riskLabel?.toUpperCase()
            }
          />

          <Line
            type="monotone"
            dataKey="riskValue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />

          {/* Trend markers */}
          {matchedTrends.map((trend, idx) => (
            <ReferenceDot
              key={idx}
              x={trend.time}
              y={trend.riskValue}
              r={6}
              fill={
                trend.direction === "up"
                  ? "#f59e0b"
                  : "#10b981"
              }
              stroke="none"
              label={{
                position: "top",
                value: trend.direction === "up" ? "▲" : "▼",
                fill:
                  trend.direction === "up"
                    ? "#f59e0b"
                    : "#10b981",
                fontSize: 14,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* ONE message only — best practice */}
      {snapshots.length > 1 && (
        <RiskRecoveryInsight snapshots={snapshots} />
      )}

      {snapshots.length <= 1 && (
        <p className="flex items-center gap-2 text-sm text-gray-500 mt-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Risk levels over time are shown for context alongside confidence changes.
        </p>
      )}
    </div>
  );
}

export default RiskTimeline;