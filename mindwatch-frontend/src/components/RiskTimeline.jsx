import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function mapRiskLevel(level) {
  if (level === "low") return 1;
  if (level === "medium") return 2;
  if (level === "high") return 3;
  return 0;
}

function RiskTimeline({ snapshots }) {
  const data = snapshots.map((s) => ({
    time: new Date(s.created_at).toLocaleDateString(),
    riskValue: mapRiskLevel(s.risk_level),
    riskLabel: s.risk_level,
  }));

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
          />
          <Tooltip
            formatter={(value, name, props) =>
              props.payload.riskLabel.toUpperCase()
            }
          />
          <Line
            type="monotone"
            dataKey="riskValue"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskTimeline;