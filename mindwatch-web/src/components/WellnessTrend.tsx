import type { CheckInRecord } from "../api/wellness";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface Props {
  history: CheckInRecord[];
}

export default function WellnessTrend({ history }: Props) {
  if (!history || history.length === 0) return null;

  const sorted = [...history].reverse(); // oldest first
  const data = sorted.map(c => ({
    date: new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: c.wellness_score,
  }));

  const lastScore = data[data.length - 1].score;
  const prevScore = data.length > 1 ? data[data.length - 2].score : lastScore;
  const delta = lastScore - prevScore;

  // Compute days diff based strictly on recorded timestamps to remain pure
  const firstDate = new Date(sorted[0].created_at);
  const lastDate = new Date(sorted[sorted.length - 1].created_at);
  const daysDiff = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / 86400000));

  return (
    <div className="w-full bg-pro-panel border border-pro-border shadow-panel p-6 rounded-xl font-sans relative overflow-hidden mt-6">
      <div className="flex items-center justify-between mb-6 border-b border-pro-border/50 pb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow"></span>
          Trajectory Analysis
        </h2>
        <span className={`text-sm font-semibold tracking-wider ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "∆POS +" : "∆NEG "}{Math.abs(delta).toFixed(1)}
        </span>
      </div>

      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b949e", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b949e", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                borderColor: "#2a3441",
                borderRadius: "8px",
                color: "#e6edf3",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
              }}
              itemStyle={{ color: "#10b981", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#scoreGradient)"
              strokeWidth={3}
              name="Readiness Score"
              activeDot={{ r: 6, fill: "#10b981", stroke: "#161b22", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mt-4 pt-4 border-t border-pro-border">
        <span>T-{daysDiff}D SPAN</span>
        <span>[{sorted.length} RECORDS]</span>
        <span>LIVE_SYSTEM_SYNC</span>
      </div>
    </div>
  );
}
