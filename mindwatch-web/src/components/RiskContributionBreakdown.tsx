import { useState } from "react";
import { computeRiskContributions } from "../utils/riskContributions";

export default function RiskContributionBreakdown({ reasons }: { reasons: string[] }) {
  const [open, setOpen] = useState(false);
  if (!reasons?.length) return null;
  const contributions = computeRiskContributions(reasons);
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
      <button onClick={() => setOpen(!open)} className="text-sm font-medium text-blue-600 hover:underline">
        {open ? "Hide contributors" : "Show risk contributors"}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {contributions.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{c.label}</span>
                <span>{c.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-3">
                <div className={`${c.color} h-3 rounded`} style={{ width: `${c.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
