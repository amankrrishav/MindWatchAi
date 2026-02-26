import type { CheckInRecord } from "../api/wellness";

interface Props {
  history: CheckInRecord[];
}

function getColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#22c55e";
  if (score >= 40) return "#eab308";
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
    <div className="w-full max-w-2xl bg-terminal-panel border border-terminal-border shadow-neon p-6 font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
          Trajectory Analysis
        </h2>
        <span className={`text-sm font-bold font-mono tracking-widest ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
          {delta >= 0 ? "∆POS +" : "∆NEG "}{Math.abs(delta).toFixed(1)}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16 overflow-visible">
        <defs>
          <linearGradient id="wt-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#wt-grad)" />
        {/* Line */}
        <polyline points={points} fill="none" stroke="#4ade80" strokeWidth={1.5} strokeLinejoin="round" className="opacity-80 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
        {/* Dots */}
        {scores.map((s, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(s)} r={3.5} fill={getColor(s)} className="drop-shadow-[0_0_3px_currentColor]" />
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-green-600 uppercase tracking-widest mt-3 pt-3 border-t border-terminal-border/50">
        <span>T-{Math.round((Date.now() - new Date(sorted[0].created_at).getTime()) / 86400000)}D</span>
        <span>[{sorted.length} RECORDS]</span>
        <span>CURRENT_SYS_TIME</span>
      </div>
    </div>
  );
}
