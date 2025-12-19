function RiskOverview({ risk }) {
  const level = risk.risk_level.toLowerCase();

  const styles = {
    high: {
      border: "border-red-500",
      bg: "bg-red-50",
      bar: "bg-red-500",
      text: "text-red-700",
      pulse: "animate-pulse",
    },
    medium: {
      border: "border-yellow-400",
      bg: "bg-yellow-50",
      bar: "bg-yellow-400",
      text: "text-yellow-700",
      pulse: "",
    },
    low: {
      border: "border-green-400",
      bg: "bg-green-50",
      bar: "bg-green-400",
      text: "text-green-700",
      pulse: "",
    },
  };

  const s = styles[level] || styles.low;

  return (
    <div
      className={`w-full max-w-3xl rounded-lg shadow-md border ${s.border} ${s.bg} flex overflow-hidden`}
    >
      {/* Severity bar */}
      <div className={`w-2 ${s.bar} ${s.pulse}`} />

      {/* Content */}
      <div className="flex-1 p-6 flex justify-between items-center">
        <div>
          <div className={`text-xl font-semibold ${s.text}`}>
            {risk.risk_level} Risk
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Current assessed mental health risk level
          </div>
        </div>

        <div className="text-sm text-gray-700">
          Confidence: {(risk.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

export default RiskOverview;