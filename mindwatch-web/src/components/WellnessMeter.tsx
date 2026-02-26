import type { WellnessScore } from "../api/wellness";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface Props {
  data: WellnessScore;
}

const COLORS = {
  emerald: "#10b981",
  green: "#3fb950",
  yellow: "#d29922",
  orange: "#f0883e",
  red: "#f85149",
  border: "#2a3441",
  muted: "#8b949e",
};

function getColor(score: number): string {
  if (score >= 80) return COLORS.emerald; // Thriving
  if (score >= 60) return COLORS.green; // Doing well
  if (score >= 40) return COLORS.yellow; // Moderate
  if (score >= 20) return COLORS.orange; // Struggling
  return COLORS.red; // Crisis
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

function RiskMeter({ score = 0 }: { score: number }) {
  const color = getColor(score);
  const label = getLabel(score);
  // Re-map wellness score (0=worst, 100=best) to angle (-90 to +90 degrees)
  // 0 -> -90 (far left, red zone) 
  // 100 -> +90 (far right, green zone)
  const angle = (score / 100) * 180 - 90;

  return (
    <div className="text-center py-4 relative flex-shrink-0 w-full max-w-[280px]">
      <svg viewBox="0 0 200 130" width="100%" className="max-w-[260px] mx-auto block drop-shadow-glow overflow-visible">
        <defs>
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.red} />
            <stop offset="25%" stopColor={COLORS.orange} />
            <stop offset="50%" stopColor={COLORS.yellow} />
            <stop offset="75%" stopColor={COLORS.green} />
            <stop offset="100%" stopColor={COLORS.emerald} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#1f2937" strokeWidth="16" strokeLinecap="round" />
        {/* Colored arc track */}
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="url(#meterGrad)" strokeWidth="16" strokeLinecap="round" opacity="0.95" />

        {/* Needle */}
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="18" stroke={color} strokeWidth="4" strokeLinecap="round" className="drop-shadow-glow" />
          <circle cx="100" cy="100" r="8" fill={color} className="drop-shadow-glow" />
          {/* Inner needle circle for style */}
          <circle cx="100" cy="100" r="3" fill="#0d1117" />
        </g>

        {/* Centered text display inside semi-circle */}
        <text x="100" y="85" textAnchor="middle" fill={color} fontSize="28" fontWeight="800" className="tracking-tight drop-shadow-glow">{score.toFixed(0)}</text>
      </svg>
      <div className="text-gray-400 font-medium text-sm mt-1">{label}</div>
    </div>
  );
}

export default function WellnessMeter({ data }: Props) {
  const score = data.wellness_score ?? 0;

  // Prepare recharts radar data by mapping over signals
  const radarData = data.signals
    ? Object.entries(data.signals).map(([k, v]) => ({
      subject: `${SIGNAL_EMOJIS[k]} ${k.replace('_', ' ')}`,
      value: v * 20, // Scale 1-5 up to 0-100 for better chart bounds
      labelOnly: SIGNAL_EMOJIS[k],
    }))
    : [];

  return (
    <div className="w-full bg-pro-panel border border-pro-border shadow-panel rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-3 mb-6 border-b border-pro-border/50 pb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Current Readiness
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Based on multi-dimensional telemetry integration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Metric 1: Readiness Gauge */}
        <div className="flex flex-col items-center justify-center">
          <RiskMeter score={score} />
        </div>

        {/* Metric 2: Radar Chart */}
        {data.signals ? (
          <div className="flex flex-col items-center w-full min-h-[300px] relative">
            <div className="w-full h-[300px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#2a3441" />
                  <PolarAngleAxis
                    dataKey="labelOnly"
                    tick={{ fill: "#e6edf3", fontSize: 20 }}
                    dy={4}
                  />
                  <Radar
                    name="Signals"
                    dataKey="value"
                    stroke="#58c4dc"
                    strokeWidth={2}
                    fill="#58c4dc"
                    fillOpacity={0.25}
                    className="drop-shadow-glow"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
            <span className="text-sm text-gray-500 italic">No telemetry signals found.</span>
          </div>
        )}
      </div>

      {/* Risk level badge */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-pro-border pt-5 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm text-gray-500 font-medium w-32 sm:w-auto">Risk Assessment</span>
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border tracking-wide uppercase ${data.risk_level === "low"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : data.risk_level === "medium"
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                : data.risk_level === "high"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
          >
            {data.risk_level}
          </span>
        </div>
        {data.reasons.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Primary Drivers:</span>
            <div className="flex flex-wrap gap-2">
              {data.reasons.slice(0, 3).map((r, i) => (
                <span key={i} className="px-2.5 py-1 bg-pro-bg border border-pro-border rounded text-xs text-gray-300 font-medium capitalize">
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
