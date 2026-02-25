import { useState } from "react";
import type { CheckInRecord, WellnessScore } from "../api/wellness";
import { acknowledgeAlert, resolveAlert } from "../api/alerts";

const SIGNAL_META: Record<string, { label: string; emoji: string; inverted: boolean }> = {
  mood:          { label: "Mood",       emoji: "😊", inverted: false },
  sleep_quality: { label: "Sleep",      emoji: "😴", inverted: false },
  energy:        { label: "Energy",     emoji: "⚡", inverted: false },
  anxiety:       { label: "Anxiety",    emoji: "😰", inverted: true  },
  social:        { label: "Social",     emoji: "🤝", inverted: false },
  focus:         { label: "Focus",      emoji: "🎯", inverted: false },
  appetite:      { label: "Appetite",   emoji: "🍽️", inverted: false },
};

function scoreColor(s: number) {
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#34d399";
  if (s >= 40) return "#f59e0b";
  if (s >= 20) return "#f97316";
  return "#ef4444";
}

function riskBadgeClass(level: string) {
  if (level === "low")    return "bg-green-100 text-green-800";
  if (level === "medium") return "bg-yellow-100 text-yellow-800";
  if (level === "high")   return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-500";
}

// ── Weekly Summary Card ────────────────────────────────────────────────────
function WeeklySummary({ history }: { history: CheckInRecord[] }) {
  const now = Date.now();
  const week = history.filter(c => now - new Date(c.created_at).getTime() < 7 * 86400_000);
  const prev = history.filter(c => {
    const age = now - new Date(c.created_at).getTime();
    return age >= 7 * 86400_000 && age < 14 * 86400_000;
  });

  const avg = (arr: CheckInRecord[]) =>
    arr.length ? Math.round(arr.reduce((s, c) => s + c.wellness_score, 0) / arr.length) : null;

  const thisWeekAvg = avg(week);
  const lastWeekAvg = avg(prev);
  const delta = thisWeekAvg !== null && lastWeekAvg !== null ? thisWeekAvg - lastWeekAvg : null;

  const best  = week.reduce((a, b) => a.wellness_score > b.wellness_score ? a : b, week[0]);
  const worst = week.reduce((a, b) => a.wellness_score < b.wellness_score ? a : b, week[0]);

  if (!week.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-800 mb-1">This week</h3>
        <p className="text-sm text-gray-400">No check-ins yet this week. Do your first one on the Wellness tab.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">This week</h3>
        <span className="text-xs text-gray-400">{week.length} check-in{week.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: thisWeekAvg ? scoreColor(thisWeekAvg) : "#9ca3af" }}>
            {thisWeekAvg ?? "—"}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Avg score</div>
          {delta !== null && (
            <div className={`text-xs font-medium mt-0.5 ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>
              {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)} vs last week
            </div>
          )}
        </div>
        <div className="text-center border-x border-gray-100">
          <div className="text-2xl font-bold text-green-500">{best?.wellness_score.toFixed(0) ?? "—"}</div>
          <div className="text-xs text-gray-500 mt-0.5">Best day</div>
          {best && <div className="text-xs text-gray-400 mt-0.5">{new Date(best.created_at).toLocaleDateString(undefined, { weekday: "short" })}</div>}
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{worst?.wellness_score.toFixed(0) ?? "—"}</div>
          <div className="text-xs text-gray-500 mt-0.5">Hardest day</div>
          {worst && <div className="text-xs text-gray-400 mt-0.5">{new Date(worst.created_at).toLocaleDateString(undefined, { weekday: "short" })}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Signal Patterns Card ───────────────────────────────────────────────────
function SignalPatterns({ history }: { history: CheckInRecord[] }) {
  if (!history.length) return null;
  const recent = history.slice(0, 14); // last 14 check-ins

  const signals = Object.keys(SIGNAL_META) as (keyof CheckInRecord)[];
  const averages = signals.map(key => {
    const avg = recent.reduce((s, c) => s + (c[key] as number), 0) / recent.length;
    const meta = SIGNAL_META[key as string];
    // For anxiety (inverted), flip: high value = bad, so effective = 6 - val
    const effective = meta.inverted ? 6 - avg : avg;
    return { key: key as string, meta, avg: parseFloat(avg.toFixed(1)), effective };
  }).sort((a, b) => a.effective - b.effective); // worst first

  const weakest  = averages.slice(0, 2);
  const strongest = averages.slice(-2).reverse();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Signal patterns</h3>
        <span className="text-xs text-gray-400">Last {recent.length} check-ins</span>
      </div>

      <div className="space-y-3">
        {averages.map(({ key, meta, avg, effective }) => {
          const pct = Math.round((effective / 5) * 100);
          const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  {meta.emoji} {meta.label}
                  {meta.inverted && <span className="text-xs text-gray-400">(lower = calmer)</span>}
                </span>
                <span className="text-xs font-semibold" style={{ color }}>{avg}/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">Needs attention</p>
          {weakest.map(w => (
            <p key={w.key} className="text-xs text-red-600">{w.meta.emoji} {w.meta.label} avg {w.avg}/5</p>
          ))}
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Strongest signals</p>
          {strongest.map(s => (
            <p key={s.key} className="text-xs text-green-600">{s.meta.emoji} {s.meta.label} avg {s.avg}/5</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Streak & Consistency Card ──────────────────────────────────────────────
function ConsistencyCard({ history }: { history: CheckInRecord[] }) {
  if (!history.length) return null;

  // Calculate streak (consecutive days with at least 1 check-in)
  const days = new Set(history.map(c => new Date(c.created_at).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }

  const lastCheckIn = new Date(history[0].created_at);
  const hoursAgo = Math.round((Date.now() - lastCheckIn.getTime()) / 3600_000);
  const lastStr = hoursAgo < 1 ? "Just now" : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

  const total = history.length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Consistency</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold text-indigo-600">{streak}</div>
          <div className="text-xs text-gray-500 mt-0.5">Day streak 🔥</div>
        </div>
        <div className="border-x border-gray-100">
          <div className="text-2xl font-bold text-gray-700">{total}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total check-ins</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-600 mt-1">{lastStr}</div>
          <div className="text-xs text-gray-500 mt-0.5">Last check-in</div>
        </div>
      </div>
    </div>
  );
}

// ── Current Risk Card ──────────────────────────────────────────────────────
function RiskCard({ risk }: { risk: WellnessScore | null }) {
  if (!risk) return null;

  const hasScore = risk.wellness_score !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Current assessment</h3>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${riskBadgeClass(risk.risk_level)}`}>
          {risk.risk_level} risk
        </span>
      </div>

      {hasScore ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl font-bold" style={{ color: scoreColor(risk.wellness_score!) }}>
              {risk.wellness_score?.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">
              Wellness score · Confidence {Math.round(risk.confidence * 100)}%
            </div>
          </div>
          {risk.reasons.length > 0 && (
            <div className="mt-2 space-y-1">
              {risk.reasons.slice(0, 4).map((r, i) => {
                const label = typeof r === "string" ? r : `${(r as any).factor}: ${(r as any).impact}`;
                return (
                  <div key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400">Complete a check-in on the Wellness tab to see your assessment.</p>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
        Powered by Risk Engine v3 · Updates after each check-in
      </div>
    </div>
  );
}

// ── Alerts Card ───────────────────────────────────────────────────────────
function AlertsCard({ alerts, onRefresh }: { alerts: any[]; onRefresh: () => void }) {
  const handle = async (id: number, action: "ack" | "resolve") => {
    if (action === "ack") await acknowledgeAlert(id);
    else await resolveAlert(id);
    onRefresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Alerts</h3>
      {!alerts.length ? (
        <p className="text-sm text-gray-400">No active alerts. The monitoring worker checks every 5 minutes.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a: any) => (
            <div key={a.id} className="border border-red-200 bg-red-50 rounded-xl p-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-xs font-bold text-red-700 uppercase">{a.risk_level} Risk</span>
                  <div className="text-xs text-red-600 mt-1">{a.reasons.slice(0, 2).join(" · ")}</div>
                  <div className="text-xs text-red-400 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handle(a.id, "ack")} className="text-xs px-2 py-1 bg-yellow-400 text-yellow-900 rounded-lg font-medium">Ack</button>
                  <button onClick={() => handle(a.id, "resolve")} className="text-xs px-2 py-1 bg-green-500 text-white rounded-lg font-medium">Resolve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Check-in History ───────────────────────────────────────────────────────
function HistoryList({ history }: { history: CheckInRecord[] }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!history.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="font-semibold text-gray-800">Check-in history</h3>
        <span className="text-xs text-indigo-600 font-medium">{open ? "Hide" : `Show ${history.length}`}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {history.map(c => {
            const isExp = expandedId === c.id;
            return (
              <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExp ? null : c.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: scoreColor(c.wellness_score) }}>
                      {c.wellness_score.toFixed(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(c.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExp ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExp && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {Object.keys(SIGNAL_META).map(key => {
                        const val = c[key as keyof CheckInRecord] as number;
                        const meta = SIGNAL_META[key];
                        const effective = meta.inverted ? 6 - val : val;
                        const color = effective >= 4 ? "#10b981" : effective >= 3 ? "#f59e0b" : "#ef4444";
                        return (
                          <div key={key} className="text-center">
                            <div className="text-base">{meta.emoji}</div>
                            <div className="text-xs font-bold mt-0.5" style={{ color }}>{val}/5</div>
                            <div className="text-xs text-gray-400">{meta.label}</div>
                          </div>
                        );
                      })}
                    </div>
                    {c.notes && (
                      <div className="mt-3 text-xs text-gray-600 bg-white rounded-lg p-2.5 border border-gray-200 italic">
                        "{c.notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main InsightsTab ───────────────────────────────────────────────────────
interface Props {
  history: CheckInRecord[];
  wellnessScore: WellnessScore | null;
  alerts: any[];
  trends: any[];
  snapshots: any[];
  onRefresh: () => void;
}

export default function InsightsTab({ history, wellnessScore, alerts, trends, snapshots, onRefresh }: Props) {
  const hasData = history.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="font-semibold text-gray-800 mb-2">No data yet</h3>
        <p className="text-sm text-gray-500">
          Complete your first check-in on the <strong>Wellness</strong> tab and come back here to see your patterns, signal analysis, and risk assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trend banner */}
      {trends.filter((t: any) => t.direction === "improving").length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">📈</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Improving trend detected</p>
            <p className="text-xs text-green-700">{trends[0].reason}</p>
          </div>
        </div>
      )}

      <WeeklySummary history={history} />
      <RiskCard risk={wellnessScore} />
      <SignalPatterns history={history} />
      <ConsistencyCard history={history} />
      <AlertsCard alerts={alerts} onRefresh={onRefresh} />
      <HistoryList history={history} />
    </div>
  );
}