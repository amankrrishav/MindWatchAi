function RiskOverview({ risk }) {
  const color =
    risk.risk_level === "high"
      ? "text-red-600"
      : risk.risk_level === "medium"
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Current Risk</h2>

      <div className={`text-3xl font-bold ${color}`}>
        {risk.risk_level.toUpperCase()}
      </div>

      <div className="mt-2 text-gray-600">
        Confidence: {(risk.confidence * 100).toFixed(0)}%
      </div>

      <ul className="mt-4 list-disc list-inside text-sm text-gray-700">
        {risk.reasons.map((reason, idx) => (
          <li key={idx}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

export default RiskOverview;