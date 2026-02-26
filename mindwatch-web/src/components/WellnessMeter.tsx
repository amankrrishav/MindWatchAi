import type { WellnessScore } from "../api/wellness";

interface Props {
  data: WellnessScore;
}

function getColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 60) return "#22c55e"; // green-500
  if (score >= 40) return "#eab308"; // yellow-500
  if (score >= 20) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

function getLabel(score: number): string {
  if (score >= 80) return "Thriving";
  if (score >= 60) return "Doing well";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Struggling";
  return "Crisis";
}

const SIGNAL_EMOJIS: Record<string, string> = {
  mood: "😊",
  sleep_quality: "😴",
  energy: "⚡",
  anxiety: "😰",
  social: "🤝",
  focus: "🎯",
  appetite: "🍽️",
};

function RadarChart({ signals }: { signals: Record<string, number> }) {
  const keys = Object.keys(signals);
  const n = keys.length;
  const cx = 140, cy = 140, r = 90;
  const size = 280;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, val: number) => {
    const a = angle(i);
    const dist = (val / 5) * r;
    return {
      x: cx + dist * Math.cos(a),
      y: cy + dist * Math.sin(a),
    };
  };

  const outerPoint = (i: number) => {
    const a = angle(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const dataPoints = keys.map((k, i) => point(i, signals[k]));
  const polyPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid rings
  const rings = [1, 2, 3, 4, 5].map((level) =>
    keys.map((_, i) => point(i, level)).map((p) => `${p.x},${p.y}`).join(" ")
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 220 220">
        {/* Grid rings */}
        {rings.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="#27272a"
            strokeWidth={1}
          />
        ))}

        {/* Spokes */}
        {keys.map((_, i) => {
          const op = outerPoint(i);
          return (
            <line key={i} x1={cx} y1={cy} x2={op.x} y2={op.y} stroke="#27272a" strokeWidth={1} />
          );
        })}

        {/* Data area */}
        <polygon points={polyPoints} fill="#10b981" fillOpacity={0.15} stroke="#10b981" strokeWidth={2} className="drop-shadow-glow-green" />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#10b981" className="drop-shadow-glow-green" />
        ))}

        {/* Labels */}
        {keys.map((k, i) => {
          const labelDist = r + 28;
          const la = angle(i);
          const lx = cx + labelDist * Math.cos(la);
          const ly = cy + labelDist * Math.sin(la);
          return (
            <text
              key={k}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={16}
              fill="#9ca3af"
            >
              {SIGNAL_EMOJIS[k]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function WellnessMeter({ data }: Props) {
  const score = data.wellness_score ?? 0;
  const color = getColor(score);
  const label = getLabel(score);

  // Arc gauge math (semi-circle)
  const R = 80;
  const cx = 110, cy = 110;
  const fraction = score / 100;

  // Arc from 180° to 0° going counterclockwise (over top)
  const arcAngle = Math.PI - fraction * Math.PI;
  const endX = cx + R * Math.cos(arcAngle);
  const endY = cy - R * Math.sin(arcAngle);

  return (
    <div className="w-full max-w-2xl bg-pro-panel border border-pro-border shadow-panel rounded-2xl p-8 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white tracking-tight">
          Current Readiness
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg width={220} height={130}>
            {/* Background arc */}
            <path
              d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
              fill="none"
              stroke="#1f2937"
              strokeWidth={18}
              strokeLinecap="round"
            />
            {/* Score arc */}
            {score > 0 && (
              <path
                d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${endX} ${endY}`}
                fill="none"
                stroke={color}
                strokeWidth={18}
                strokeLinecap="round"
                className="drop-shadow-glow"
              />
            )}
            {/* Score text */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize={36} fontWeight="700" fill={color} className="drop-shadow-glow font-sans">
              {score.toFixed(0)}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize={13} fill="#9ca3af" className="font-medium">
              {label}
            </text>
          </svg>
        </div>

        {/* Radar */}
        {data.signals ? (
          <div className="flex flex-col items-center">
            <RadarChart signals={data.signals} />
            <div className="grid grid-cols-4 gap-x-4 gap-y-2 mt-4 text-sm text-gray-400">
              {Object.entries(data.signals).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="opacity-80">{SIGNAL_EMOJIS[k]}</span>
                  <strong className="text-gray-200 font-medium">{v}</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic px-8">No telemetry data signal available.</div>
        )}
      </div>

      {/* Risk level badge */}
      {/* Risk level badge */}
      <div className="mt-8 flex items-center justify-between border-t border-pro-border pt-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Risk Assessment</span>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${data.risk_level === "low"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : data.risk_level === "medium"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : data.risk_level === "high"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
          >
            {data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1)}
          </span>
        </div>
        {data.reasons.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Primary Drivers:</span>
            <div className="flex gap-2">
              {data.reasons.slice(0, 2).map((r, i) => (
                <span key={i} className="px-2 py-1 bg-pro-bg border border-pro-border rounded text-xs text-gray-300 font-medium">
                  {r.factor.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
