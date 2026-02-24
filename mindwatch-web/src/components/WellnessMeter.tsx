import type { WellnessScore } from "../api/wellness";

interface Props {
  data: WellnessScore;
}

function getColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 60) return "#22c55e"; // green
  if (score >= 40) return "#f59e0b"; // amber
  if (score >= 20) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getLabel(score: number): string {
  if (score >= 80) return "Thriving";
  if (score >= 60) return "Doing well";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Struggling";
  return "Crisis";
}

const SIGNAL_LABELS: Record<string, string> = {
  mood: "Mood",
  sleep_quality: "Sleep",
  energy: "Energy",
  anxiety: "Anxiety",
  social: "Connection",
  focus: "Focus",
  appetite: "Appetite",
};

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
    <svg width={280} height={280} className="mx-auto">
      {/* Grid rings */}
      {rings.map((pts, idx) => (
        <polygon
          key={idx}
          points={pts}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {/* Spokes */}
      {keys.map((_, i) => {
        const op = outerPoint(i);
        return (
          <line key={i} x1={cx} y1={cy} x2={op.x} y2={op.y} stroke="#e5e7eb" strokeWidth={1} />
        );
      })}
      {/* Data area */}
      <polygon points={polyPoints} fill="#6366f1" fillOpacity={0.25} stroke="#6366f1" strokeWidth={2} />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#6366f1" />
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
            fill="#6b7280"
          >
            {SIGNAL_EMOJIS[k]}
          </text>
        );
      })}
    </svg>
  );
}

export default function WellnessMeter({ data }: Props) {
  const score = data.wellness_score ?? 0;
  const color = getColor(score);
  const label = getLabel(score);

  // Arc gauge math (semi-circle)
  const R = 80;
  const cx = 110, cy = 110;
  const startAngle = Math.PI; // left
  const endAngle = 0; // right (semi-circle from left to right via top)
  const fraction = score / 100;

  // Arc from 180° to 0° going counterclockwise (over top)
  const arcAngle = Math.PI - fraction * Math.PI;
  const endX = cx + R * Math.cos(arcAngle);
  const endY = cy - R * Math.sin(arcAngle);

  const bgEndX = cx - R;
  const bgEndY = cy;

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Wellness Score</h2>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg width={220} height={130}>
            {/* Background arc */}
            <path
              d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
              fill="none"
              stroke="#e5e7eb"
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
              />
            )}
            {/* Score text */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize={32} fontWeight="bold" fill={color}>
              {score.toFixed(0)}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize={13} fill="#6b7280">
              {label}
            </text>
          </svg>
        </div>

        {/* Radar */}
        {data.signals ? (
          <div className="flex flex-col items-center">
            <RadarChart signals={data.signals} />
            <div className="grid grid-cols-4 gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
              {Object.entries(data.signals).map(([k, v]) => (
                <span key={k}>
                  {SIGNAL_EMOJIS[k]} {SIGNAL_LABELS[k]}: <strong>{v}</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">Complete a check-in to see your signal radar.</div>
        )}
      </div>

      {/* Risk level badge */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            data.risk_level === "low"
              ? "bg-green-100 text-green-800"
              : data.risk_level === "medium"
              ? "bg-amber-100 text-amber-800"
              : data.risk_level === "high"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {data.risk_level.toUpperCase()} RISK
        </span>
        {data.reasons.length > 0 && (
          <span className="text-xs text-gray-400">
            {data.reasons.slice(0, 2).map((r) => r.factor).join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}
