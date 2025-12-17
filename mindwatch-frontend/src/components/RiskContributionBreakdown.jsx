import { computeRiskContributions } from "../utils/riskContributions";

function RiskContributionBreakdown({ reasons }) {
  if (!reasons || !reasons.length) return null;

  const contributions = computeRiskContributions(reasons);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Risk Contributors
      </h2>

      <div className="space-y-4">
        {contributions.map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{c.label}</span>
              <span>{c.value}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded h-3">
              <div
                className={`${c.color} h-3 rounded`}
                style={{ width: `${c.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskContributionBreakdown;