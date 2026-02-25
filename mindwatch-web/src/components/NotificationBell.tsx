import { useState } from "react";
import type { NotificationIntent } from "../api/notifications";
import { markNotificationHandled } from "../api/notifications";

interface Props {
  notifications: NotificationIntent[];
  onRefresh: () => void;
}

export default function NotificationBell({ notifications, onRefresh }: Props) {
  const [open, setOpen] = useState(false);

  const handleMarkHandled = async (id: string) => {
    await markNotificationHandled(id);
    onRefresh();
  };

  const hasUnread = notifications.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-800">Notifications</span>
              {hasUnread && (
                <span className="text-xs text-indigo-600 font-medium">{notifications.length} unread</span>
              )}
            </div>

            {!hasUnread ? (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-500">You're all caught up!</p>
                <p className="text-xs text-gray-400 mt-1">Alerts appear here when risk patterns are detected.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <li key={n.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${n.priority === "high" ? "text-red-600" : "text-gray-500"}`}>
                          {n.intent_type.replace(/_/g, " ")}
                        </span>
                        <p className="text-sm text-gray-800 mt-0.5">{n.reason}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleMarkHandled(n.id)}
                        className="text-xs px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded shrink-0 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
