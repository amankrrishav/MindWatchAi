import { useState } from "react";
import type { NotificationIntent } from "../api/notifications";
import { markNotificationHandled, markAllNotificationsHandled } from "../api/notifications";

interface Props {
  notifications: NotificationIntent[];
  onRefresh: () => void;
}

const getCategory = (type: string) => {
  if (["risk_high", "alert_actionable"].includes(type)) return "ALERTS";
  if (["score_high", "streak_milestone"].includes(type)) return "MILESTONES";
  if (["risk_improving", "weekly_digest"].includes(type)) return "INSIGHTS";
  return "SYSTEM";
};

export default function NotificationBell({ notifications, onRefresh }: Props) {
  const [open, setOpen] = useState(false);

  const handleMarkHandled = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await markNotificationHandled(id);
    onRefresh();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsHandled();
    onRefresh();
  };

  const hasUnread = notifications.length > 0;

  // Group notifications
  const grouped = notifications.reduce((acc, current) => {
    const cat = getCategory(current.intent_type);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(current);
    return acc;
  }, {} as Record<string, NotificationIntent[]>);

  const order = ["ALERTS", "INSIGHTS", "MILESTONES", "SYSTEM"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition-colors hover:bg-pro-panel ${open ? "bg-pro-panel text-white" : "text-gray-400 hover:text-gray-200"}`}
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {hasUnread && (
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 mt-2 w-80 md:w-96 max-h-[80vh] overflow-y-auto bg-pro-panel border border-pro-border rounded-xl shadow-panel z-50 font-sans custom-scrollbar">
            <div className="px-5 py-4 border-b border-pro-border bg-pro-panel flex items-center justify-between sticky top-0 z-10">
              <span className="font-semibold text-sm text-white">
                Notifications
              </span>
              {hasUnread && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium bg-gray-800 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                  <button onClick={handleMarkAll} className="text-xs text-pro-accent hover:text-pro-accentHover font-medium transition-colors">
                    Mark All Read
                  </button>
                </div>
              )}
            </div>

            {!hasUnread ? (
              <div className="px-5 py-12 text-center bg-pro-bg">
                <div className="w-12 h-12 rounded-full bg-gray-800/50 border border-gray-700/50 mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <p className="text-sm text-gray-300 font-medium">You're all caught up</p>
                <p className="text-xs text-gray-500 mt-1">No new notifications at this time.</p>
              </div>
            ) : (
              <div className="bg-pro-bg pb-2">
                {order.map(category => {
                  const msgs = grouped[category];
                  if (!msgs || msgs.length === 0) return null;
                  return (
                    <div key={category} className="mb-1 last:mb-0">
                      <div className="px-4 py-2 bg-gray-900 border-y border-pro-border text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{category}</span>
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">{msgs.length}</span>
                      </div>
                      <ul className="divide-y divide-pro-border">
                        {msgs.map((n) => (
                          <li key={n.id} className="p-4 hover:bg-pro-panel transition-colors group relative">
                            <div className={`absolute left-0 top-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity ${n.priority === 'high' ? 'bg-red-500' : 'bg-pro-accent'}`}></div>
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-bold uppercase tracking-wider ${n.priority === "high" ? "text-red-400" :
                                  category === "MILESTONES" ? "text-yellow-400" :
                                    "text-emerald-500"
                                  }`}>
                                  {n.intent_type.replace(/_/g, " ")}
                                </span>
                                <p className="text-sm text-gray-300 mt-1.5 leading-snug">{n.reason}</p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleMarkHandled(n.id, e)}
                                className="text-xs font-medium px-2 py-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors shrink-0"
                              >
                                Dismiss
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
