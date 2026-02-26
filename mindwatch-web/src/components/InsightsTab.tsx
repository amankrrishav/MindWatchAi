import { useState } from "react";
import type { CheckInRecord, WellnessScore } from "../api/wellness";
import { acknowledgeAlert, resolveAlert } from "../api/alerts";

const SIGNAL_META: Record<string, { label: string; emoji: string; inverted: boolean }> = {
  mood: { label: "Mood", emoji: "😊", inverted: false },
  sleep_quality: { label: "Sleep", emoji: "😴", inverted: false },
  energy: { label: "Energy", emoji: "⚡", inverted: false },
  anxiety: { label: "Anxiety", emoji: "😰", inverted: true },
  social: { label: "Social", emoji: "🤝", inverted: false },
  focus: { label: "Focus", emoji: "🎯", inverted: false },
  appetite: { label: "Appetite", emoji: "🍽️", inverted: false },
};

function scoreColor(s: number) {
  if (s >= 80) return "#4ade80";
  if (s >= 60) return "#22c55e";
  if (s >= 40) return "#eab308";
  if (s >= 20) return "#f97316";
  return "#ef4444";
}

function riskBadgeClass(level: string) {
  if (level === "low") return "bg-green-900/40 text-green-400 border border-green-500 shadow-[0_0_5px_rgba(74,222,128,0.5)]";
  if (level === "medium") return "bg-yellow-900/40 text-yellow-400 border border-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]";
  if (level === "high") return "bg-red-900/40 text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]";
  return "bg-terminal-bg text-green-600 border border-terminal-border";
}

// ── Common Box ────────────────────────────────────────────────────────────
function TerminalBox({ title, children, rightInfo }: { title: string; children: React.ReactNode; rightInfo?: React.ReactNode }) {
  return (
    <div className="bg-pro-panel border border-pro-border rounded-xl shadow-panel p-6 overflow-hidden relative">
      <div className="flex items-center justify-between border-b border-pro-border pb-4 mb-5">
        <h3 className="font-semibold text-white tracking-tight flex items-center gap-2 text-lg">
          {title}
        </h3>
        {rightInfo && <span className="text-sm font-medium text-gray-400">{rightInfo}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="h-6 w-[80px] bg-pro-bg border border-pro-border rounded-md flex items-center justify-center text-xs text-gray-500">No Data</div>;
  const max = 5;
  const min = 1;
  const w = 80, h = 24;
  const dx = w / (data.length - 1);

  const pts = data.map((val, i) => {
    const x = i * dx;
    const y = h - Math.max(0, Math.min(1, (val - min) / (max - min))) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible min-w-[80px]">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" className="opacity-60" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((val, i) => {
        const x = i * dx;
        const y = h - Math.max(0, Math.min(1, (val - min) / (max - min))) * h;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} className="drop-shadow-[0_0_3px_currentColor]" />;
      })}
    </svg>
  );
}

// ── HeatmapCalendar ────────────────────────────────────────────────────────
function HeatmapCalendar({ history }: { history: CheckInRecord[] }) {
  const days = [];
  const today = new Date();
  // 21 days for 3 weeks
  for (let i = 20; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toDateString());
  }
  const byDate = new Map(history.map(c => [new Date(c.created_at).toDateString(), c.wellness_score]));

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">21-Day Intensity Map</div>
      <div className="flex gap-1 flex-wrap">
        {days.map(d => {
          const score = byDate.get(d);
          let bg = "bg-pro-bg border border-pro-border rounded-sm";
          if (score !== undefined) {
            if (score >= 80) bg = "bg-emerald-500 shadow-glow-green rounded-sm";
            else if (score >= 60) bg = "bg-emerald-600/80 rounded-sm";
            else if (score >= 40) bg = "bg-yellow-500/80 rounded-sm";
            else if (score >= 20) bg = "bg-orange-500/80 rounded-sm";
            else bg = "bg-red-500/80 rounded-sm";
          }
          return <div key={d} className={`w-4 h-4 transition-all hover:scale-110 ${bg}`} title={`${d}${score ? ` | Score: ${score.toFixed(0)}` : " | No Data"}`} />;
        })}
      </div>
    </div>
  )
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

  if (!week.length) {
    return (
      <TerminalBox title="System Overview">
        <p className="text-sm text-gray-500">Current week data unavailable.</p>
      </TerminalBox>
    );
  }

  return (
    <TerminalBox title="System Overview" rightInfo={`Last ${week.length} Runs`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-pro-border rounded-lg p-4 bg-pro-bg relative">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mean Vector</div>
          <div className="text-3xl font-bold" style={{ color: thisWeekAvg ? scoreColor(thisWeekAvg) : "#374151" }}>
            {thisWeekAvg?.toFixed(1) ?? "0.0"}
          </div>
          {delta !== null && (
            <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {delta >= 0 ?
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                :
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              }
              {Math.abs(delta).toFixed(1)} pt
            </div>
          )}
        </div>

        <div className="border border-pro-border rounded-lg p-4 bg-pro-bg col-span-2 lg:col-span-3">
          <HeatmapCalendar history={history} />
        </div>
      </div>
    </TerminalBox>
  );
}

// ── Signal Patterns Card ───────────────────────────────────────────────────
function SignalPatterns({ history }: { history: CheckInRecord[] }) {
  if (!history.length) return null;
  const recent = history.slice(0, 14); // last 14 check-ins for latest data bias, but sparkline needs chronological
  const chronological = [...recent].reverse();

  const signals = Object.keys(SIGNAL_META) as (keyof CheckInRecord)[];

  const metrics = signals.map(key => {
    const dataPoints = chronological.map(c => c[key] as number);
    const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
    const meta = SIGNAL_META[key as string];
    const effective = meta.inverted ? 6 - avg : avg;
    return { key: key as string, meta, avg: avg.toFixed(1), effective, dataPoints };
  }).sort((a, b) => a.effective - b.effective);

  return (
    <TerminalBox title="Pattern Detection Matrix" rightInfo={`N=${recent.length}`}>
      <div className="space-y-3">
        {metrics.map(({ key, meta, avg, effective, dataPoints }) => {
          const pct = Math.round((effective / 5) * 100);
          const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#eab308" : "#ef4444";

          return (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border border-pro-border rounded-lg bg-pro-bg">
              <div className="flex-1 flex justify-between items-center mr-2">
                <span className="flex items-center gap-2 text-gray-200 font-medium text-sm">
                  <span>{meta.emoji}</span>
                  {meta.label}
                  {meta.inverted && <span className="text-xs text-gray-500 font-normal hidden sm:inline">(Inverted)</span>}
                </span>
                <span className="text-sm font-semibold ml-2" style={{ color }}>
                  {avg}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Sparkline data={dataPoints} color={color} />
                <div className="w-24 bg-pro-panel border border-pro-border rounded-full h-2 hidden sm:block relative overflow-hidden">
                  <div className="h-full absolute top-0 left-0 transition-all duration-500 rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border border-pro-border rounded-lg p-4 bg-pro-bg text-sm">
        <div className="text-gray-400 font-medium mb-1">Inference:</div>
        {metrics[0].effective < 3.5 ? (
          <div className="text-red-400">Warning: <strong>{metrics[0].meta.label}</strong> stability is low. Recommend focus on improving this metric.</div>
        ) : (
          <div className="text-emerald-400">All primary signals holding within acceptable parameters.</div>
        )}
      </div>
    </TerminalBox>
  );
}

// ── Streak & Consistency Card ──────────────────────────────────────────────
function ConsistencyCard({ history }: { history: CheckInRecord[] }) {
  if (!history.length) return null;

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
  const lastStr = hoursAgo < 1 ? "Just now" : hoursAgo < 24 ? `${hoursAgo} hrs ago` : `${Math.floor(hoursAgo / 24)} days ago`;

  return (
    <TerminalBox title="Continuity">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="border border-emerald-500/20 rounded-lg bg-emerald-500/5 p-4 relative overflow-hidden">
          <div className="text-3xl font-bold text-emerald-400 drop-shadow-glow-green">{streak}</div>
          <div className="text-xs uppercase font-semibold text-emerald-500/70 mt-2 tracking-wider">Day Streak</div>
        </div>
        <div className="border border-pro-border rounded-lg bg-pro-bg p-4 relative overflow-hidden">
          <div className="text-3xl font-bold text-gray-200">{history.length}</div>
          <div className="text-xs uppercase font-semibold text-gray-500 mt-2 tracking-wider">Check-ins</div>
        </div>
        <div className="border border-pro-border rounded-lg bg-pro-bg p-4 relative overflow-hidden flex flex-col justify-center">
          <div className="text-sm font-semibold text-gray-300">{lastStr}</div>
          <div className="text-xs uppercase font-semibold text-gray-500 mt-2 tracking-wider">Last Sync</div>
        </div>
      </div>
    </TerminalBox>
  );
}

// ── Current Risk Card ──────────────────────────────────────────────────────
function RiskCard({ risk }: { risk: WellnessScore | null }) {
  if (!risk) return null;
  const hasScore = risk.wellness_score !== null;

  return (
    <TerminalBox title="Threat Assessment" rightInfo={`v3 Engine`}>
      <div className="flex items-center justify-between mb-6 border-b border-pro-border pb-4">
        <h3 className="font-semibold text-gray-400 uppercase tracking-wider text-xs">Risk Level</h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${riskBadgeClass(risk.risk_level)}`}>
          {risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1)}
        </span>
      </div>

      {hasScore ? (
        <>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-6xl font-bold" style={{ color: scoreColor(risk.wellness_score!) }}>
              {risk.wellness_score?.toFixed(1)}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-xs text-gray-400 border border-gray-700 bg-gray-800 rounded px-2.5 py-1 inline-flex w-max items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Confidence: {(risk.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          {risk.reasons.length > 0 && (
            <div className="bg-pro-bg border border-pro-border rounded-lg p-4 space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Primary Drivers</div>
              <div className="grid grid-cols-2 gap-2">
                {risk.reasons.slice(0, 4).map((r, i) => {
                  const label = typeof r === "string" ? r : `${(r as any).factor}`;
                  return (
                    <div key={i} className="text-sm text-gray-300 font-medium flex items-center gap-2 bg-pro-panel border border-pro-border rounded px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      {label.replace('_', ' ')}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">Awaiting initial telemetry upload...</p>
      )}
    </TerminalBox>
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
    <TerminalBox title="Active Alerts" rightInfo={alerts.length ? `${alerts.length} Action Required` : undefined}>
      {!alerts.length ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm text-gray-400">Daemon active. No critical events detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a: any) => (
            <div key={a.id} className="border border-red-500/20 bg-red-500/5 rounded-lg p-5">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                  <span className="text-sm font-bold text-red-400 capitalize flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    {a.risk_level} Risk Event
                  </span>
                  <div className="text-sm text-gray-300 mt-2 flex flex-col gap-1.5">
                    {a.reasons.slice(0, 3).map((r: string, i: number) => <span key={i} className="flex items-start gap-2"><span className="text-red-500/50 mt-1">•</span>{r}</span>)}
                  </div>
                  <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 md:flex-col lg:flex-row mt-2 md:mt-0">
                  <button onClick={() => handle(a.id, "ack")} className="text-xs px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-md font-medium transition-colors shadow-sm w-full lg:w-auto">Acknowledge</button>
                  <button onClick={() => handle(a.id, "resolve")} className="text-xs px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-medium transition-colors shadow-sm w-full lg:w-auto">Resolve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TerminalBox>
  );
}

// ── Check-in History ───────────────────────────────────────────────────────
function HistoryList({ history }: { history: CheckInRecord[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!history.length) return null;

  return (
    <TerminalBox title="Telemetry Logs" rightInfo={`${history.length} Records`}>
      <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {history.map(c => {
          const isExp = expandedId === c.id;
          return (
            <div key={c.id} className="border border-pro-border bg-pro-bg rounded-lg transition-colors overflow-hidden data-[expanded=true]:border-pro-accent" data-expanded={isExp}>
              <button
                onClick={() => setExpandedId(isExp ? null : c.id)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none hover:bg-pro-panel"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg border flex items-center justify-center font-bold text-xl"
                    style={{ borderColor: scoreColor(c.wellness_score), color: scoreColor(c.wellness_score) }}>
                    {c.wellness_score.toFixed(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-200">
                      {new Date(c.created_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(c.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="text-gray-500">
                  <svg className={`w-5 h-5 transition-transform ${isExp ? "rotate-180 text-pro-accent" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExp && (
                <div className="p-5 border-t border-pro-border bg-pro-panel/30">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.keys(SIGNAL_META).map(key => {
                      const val = c[key as keyof CheckInRecord] as number;
                      const meta = SIGNAL_META[key];
                      const effective = meta.inverted ? 6 - val : val;
                      const color = effective >= 4 ? "#10b981" : effective >= 3 ? "#eab308" : "#ef4444";
                      return (
                        <div key={key} className="bg-pro-bg border border-pro-border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-400">{meta.label}</span>
                            <span className="text-sm font-semibold" style={{ color }}>{val}/5</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            {/* progress bar visual */}
                            <div className="h-full rounded-full transition-all" style={{ width: `${(effective / 5) * 100}%`, background: color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {c.notes && (
                    <div className="mt-5 p-4 rounded-lg bg-pro-bg border border-pro-border text-gray-300 text-sm leading-relaxed flex gap-3">
                      <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      <p>"{c.notes}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TerminalBox>
  );
}

// ── Main InsightsTab ───────────────────────────────────────────────────────
interface Props {
  history: CheckInRecord[];
  wellnessScore: WellnessScore | null;
  alerts: any[];
  trends: any[];
  onRefresh: () => void;
}

export default function InsightsTab({ history, wellnessScore, alerts, trends, onRefresh }: Props) {
  const hasData = history.length > 0;

  if (!hasData) {
    return (
      <div className="bg-pro-panel border border-pro-border rounded-xl shadow-panel p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-gray-800/50 border border-gray-700/50 mx-auto flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No Insights Available</h3>
        <p className="text-gray-400">
          We need at least one completed wellness check-in to generate insights and trend analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend banner */}
      {trends.filter((t: any) => t.direction === "improving").length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-xl">📈</span>
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-emerald-400">Positive Shift Detected</p>
            <p className="text-sm text-emerald-500/80 mt-1">{trends.find(t => t.direction === "improving")?.reason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RiskCard risk={wellnessScore} />
          <WeeklySummary history={history} />
        </div>
        <div className="space-y-6">
          <AlertsCard alerts={alerts} onRefresh={onRefresh} />
          <ConsistencyCard history={history} />
        </div>
      </div>

      <SignalPatterns history={history} />
      <HistoryList history={history} />
    </div>
  );
}