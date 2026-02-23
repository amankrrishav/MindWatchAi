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
    ? "bg-yellow-50 border-yellow-400 text-yellow-800"
    : "bg-green-50 border-green-400 text-green-800";
  return (
    <div className={`w-full max-w-3xl p-4 rounded-lg border-l-4 ${color}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg font-bold">{isAccelerating ? "▲" : "▼"}</span>
        <div>
          <div className="font-semibold">{isAccelerating ? "Risk appears to be increasing" : "Risk appears to be improving"}</div>
          <div className="text-sm mt-1">{trend!.reason}</div>
          <div className="text-xs mt-2 opacity-70">Early signal — not an alert</div>
        </div>
      </div>
    </div>
  );
}
