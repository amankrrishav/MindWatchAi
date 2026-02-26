interface Risk {
  risk_level: string;
  confidence: number;
}

const styles: Record<string, { border: string; bg: string; bar: string; text: string; pulse: string }> = {
  high: { border: "border-red-500/20", bg: "bg-red-500/5", bar: "bg-red-500", text: "text-red-400", pulse: "animate-pulse" },
  medium: { border: "border-yellow-500/20", bg: "bg-yellow-500/5", bar: "bg-yellow-500", text: "text-yellow-400", pulse: "" },
  low: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", bar: "bg-emerald-500", text: "text-emerald-400", pulse: "" },
};

export default function RiskOverview({ risk }: { risk: Risk }) {
  const level = risk.risk_level.toLowerCase();
  const s = styles[level] ?? styles.low;
  return (
    <div className={`w-full max-w-3xl rounded-xl shadow-panel border ${s.border} ${s.bg} flex overflow-hidden font-sans`}>
      <div className={`w-1.5 ${s.bar} ${s.pulse}`} />
      <div className="flex-1 p-6 flex justify-between items-center">
        <div>
          <div className={`text-xl font-semibold tracking-tight ${s.text} capitalize flex items-center gap-2`}>
            {risk.risk_level} Risk
          </div>
          <div className="text-sm text-gray-400 mt-1">Current assessed mental health risk level</div>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 shadow-sm">
          Confidence: {(risk.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
