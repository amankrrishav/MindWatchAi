import type { CheckInRecord } from "../api/wellness";

interface Props {
  history: CheckInRecord[];
}

function getColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

export default function WellnessTrend({ history }: Props) {
  if (!history || history.length === 0) return null;

  const sorted = [...history].reverse(); // oldest first
  const W = 500, H = 80;
  const PAD = 10;
  const scores = sorted.map((c) => c.wellness_score);
  const min = 0, max = 100;

  const xScale = (i: number) =>
    PAD + (i / Math.max(scores.length - 1, 1)) * (W - 2 * PAD);
  const yScale = (v: number) =>
    H - PAD - ((v - min) / (max - min)) * (H - 2 * PAD);

  const points = scores.map((s, i) => `${xScale(i)},${yScale(s)}`).join(" ");
  const areaPoints = [
    `${xScale(0)},${H}`,
    ...scores.map((s, i) => `${xScale(i)},${yScale(s)}`),
    `${xScale(scores.length - 1)},${H}`,
  ].join(" ");

  const lastScore = scores[scores.length - 1];
  const prevScore = scores.length > 1 ? scores[scores.length - 2] : lastScore;
  const delta = lastScore - prevScore;

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Wellness Trend</h2>
        <span className={`text-sm font-medium ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)} pts
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
        <defs>
          <linearGradient id="wt-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#wt-grad)" />
        {/* Line */}
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
        {/* Dots */}
        {scores.map((s, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(s)} r={3} fill={getColor(s)} />
        ))}
      </svg>

      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{new Date(sorted[0].created_at).toLocaleDateString()}</span>
        <span>{sorted.length} check-ins</span>
        <span>{new Date(sorted[sorted.length - 1].created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
