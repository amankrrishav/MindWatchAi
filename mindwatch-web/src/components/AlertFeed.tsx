import { useState } from "react";
import { acknowledgeAlert, resolveAlert } from "../api/alerts";

interface Alert {
  id: number;
  risk_level: string;
  confidence: number;
  reasons: string[];
  created_at: string;
}

export default function AlertFeed({ alerts, onRefresh }: { alerts: Alert[]; onRefresh: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!alerts.length) {
    return (
      <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
        <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Active Alerts</h2>
        <div className="text-gray-500 text-sm">No active alerts</div>
      </div>
    );
  }

  const handleAcknowledge = async (id: number) => {
    await acknowledgeAlert(id);
    onRefresh();
  };

  const handleResolve = async (id: number) => {
    await resolveAlert(id);
    onRefresh();
  };

  return (
    <div className="bg-pro-panel p-6 rounded-xl shadow-panel border border-pro-border w-full max-w-3xl mt-6 font-sans">
      <h2 className="text-xl font-semibold text-white mb-5 tracking-tight flex items-center gap-2">
        Active Alerts
        <span className="bg-red-500/10 text-red-500 text-xs py-0.5 px-2 rounded-full border border-red-500/20">{alerts.length}</span>
      </h2>
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isOpen = expandedId === alert.id;
          return (
            <div key={alert.id} className={`border rounded-lg transition-colors overflow-hidden ${isOpen ? 'border-pro-accent bg-pro-bg' : 'border-pro-border bg-pro-bg hover:border-gray-600'}`}>
              <div
                className="flex items-center justify-between p-4 cursor-pointer relative"
                onClick={() => setExpandedId(isOpen ? null : alert.id)}
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-red-500 rounded-l-lg"></div>
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  </div>
                  <div>
                    <div className="font-semibold text-red-400 capitalize">{alert.risk_level} Risk Alert</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(alert.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="text-gray-500">
                  <svg className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180 text-pro-accent" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isOpen && (
                <div className="px-6 pb-5 pt-3 border-t border-pro-border bg-pro-panel/30 text-sm text-gray-300">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence Level</span>
                    <div className="bg-gray-800 border border-gray-700 rounded px-2 py-1 flex items-center gap-1.5">
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden w-16">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${alert.confidence * 100}%` }}></div>
                      </div>
                      <span className="text-gray-200 font-medium">{(alert.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Drivers</span>
                    <ul className="space-y-1.5">
                      {alert.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 bg-gray-800/50 p-2 rounded border border-gray-700/50">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-pro-border/50">
                    <button onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id); }} className="text-sm font-medium px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors shadow-sm flex items-center gap-1.5">
                      Acknowledge
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleResolve(alert.id); }} className="text-sm font-medium px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Resolve Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
