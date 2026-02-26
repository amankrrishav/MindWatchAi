import { useState } from "react";
import { computeRiskContributions } from "../utils/riskContributions";

export default function RiskContributionBreakdown({ reasons }: { reasons: string[] }) {
  const [open, setOpen] = useState(false);
  if (!reasons?.length) return null;
  const contributions = computeRiskContributions(reasons);
  return (
    <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
      <button onClick={() => setOpen(!open)} className="text-sm font-medium text-pro-accent hover:text-pro-accentHover transition-colors flex items-center gap-1.5">
        <span>{open ? "Hide contributors" : "Show risk contributors"}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="mt-6 space-y-5">
          {contributions.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">{c.label}</span>
                <span className="text-gray-400 font-mono text-xs">{c.value}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className={`${c.color.replace('bg-red-500', 'bg-red-500').replace('bg-yellow-500', 'bg-yellow-500').replace('bg-green-500', 'bg-emerald-500')} h-2 rounded-full transition-all`} style={{ width: `${c.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
