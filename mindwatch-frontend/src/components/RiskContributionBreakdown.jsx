import { useState } from "react";
import { computeRiskContributions } from "../utils/riskContributions";

function RiskContributionBreakdown({ reasons }) {
  const [open, setOpen] = useState(false);

  if (!reasons || !reasons.length) return null;

  const contributions = computeRiskContributions(reasons);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      
      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {open ? "Hide contributors" : "Show risk contributors"}
      </button>

      {/* Progressive disclosure */}
      {open && (
        <div className="mt-4 space-y-4">
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
      )}
    </div>
  );
}

export default RiskContributionBreakdown;