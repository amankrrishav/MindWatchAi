interface Trend {
  direction: string;
  severity: string;
  reason: string;
}

export default function RiskTrendBanner({ trends }: { trends: Trend[] }) {
  if (!trends?.length) return null;
  const accelerating = trends.find((t) => t.direction === "up" && t.severity === "accelerating");
  const recovering = trends.find((t) => t.direction === "down" && t.severity === "recovering");
  if (!accelerating && !recovering) return null;
  const trend = accelerating ?? recovering;
  const isAccelerating = Boolean(accelerating);
  const color = isAccelerating
    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  return (
    <div className={`w-full max-w-3xl p-5 rounded-xl border-l-[3px] ${color} shadow-sm font-sans mt-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold">{isAccelerating ? "▲" : "▼"}</span>
        <div>
          <div className="font-semibold tracking-tight text-white mb-0.5">{isAccelerating ? "Risk appears to be increasing" : "Risk appears to be improving"}</div>
          <div className="text-sm opacity-90">{trend!.reason}</div>
          <div className="text-xs mt-3 flex items-center gap-1.5 opacity-60 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Early signal — not an alert
          </div>
        </div>
      </div>
    </div>
  );
}
