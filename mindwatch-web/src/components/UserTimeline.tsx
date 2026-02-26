import type { TimelineEntry } from "../api/timeline";

interface Props {
    events: TimelineEntry[];
}

export default function UserTimeline({ events }: Props) {
    if (!events || events.length === 0) {
        return (
            <div className="bg-pro-panel border border-pro-border shadow-panel p-6 rounded-xl flex items-center justify-center min-h-[200px]">
                <span className="text-gray-500 italic text-sm">No activity events found yet.</span>
            </div>
        );
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case "checkin": return "📝";
            case "alert": return "🚨";
            default: return "⚡";
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "medium": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
            default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        }
    };

    return (
        <div className="glass-panel rounded-xl relative p-6">
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-glow">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Timeline & Activity Log</h2>
            </div>

            <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                {events.slice(0, 50).map((evt, idx) => (
                    <div key={`${evt.timestamp}-${idx}`} className="relative pl-8 sm:pl-10 group animate-[slide-in_0.5s_ease-out_forwards]" style={{ animationDelay: `${idx * 100}ms` }}>
                        {/* Connecting Line Enhancement */}
                        <div className="absolute -left-[1px] top-8 bottom-[-2rem] w-[2px] bg-gradient-to-b from-white/10 to-transparent group-last:hidden"></div>

                        {/* Timeline Dot/Icon */}
                        <div className={`absolute -left-4 top-1 w-8 h-8 rounded-full flex items-center justify-center border ${getSeverityColor(evt.severity)} shadow-glow backdrop-blur-md z-10 transition-transform group-hover:scale-110 duration-300`}>
                            <span className="text-sm">{getSourceIcon(evt.source)}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <span className="text-xs font-mono text-gray-400">
                                {new Date(evt.timestamp).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                })}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm ${getSeverityColor(evt.severity)}`}>
                                {evt.source} / {evt.severity}
                            </span>
                        </div>

                        <div className="glass-card rounded-lg p-4 transition-all duration-300 hover:bg-white/10">
                            <p className="text-sm text-gray-200 font-medium mb-1">
                                Risk Transition: <span className="text-white capitalize">{evt.risk_level}</span>
                            </p>
                            {evt.reasons && evt.reasons.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {evt.reasons.map((r, i) => (
                                        <span key={i} className="px-2 py-1 bg-pro-panel border border-pro-border rounded text-xs text-gray-400">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
