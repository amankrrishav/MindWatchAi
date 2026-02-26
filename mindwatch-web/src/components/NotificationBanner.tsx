import { useState } from "react";
import type { NotificationIntent } from "../api/notifications";
import { markNotificationHandled } from "../api/notifications";

interface Props {
  notifications: NotificationIntent[];
  onRefresh: () => void;
}

export default function NotificationBanner({ notifications, onRefresh }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const highPriority = notifications.filter((n) => n.priority === "high" && !dismissed.has(n.id));
  if (highPriority.length === 0) return null;

  const top = highPriority[0];

  const handleDismiss = async () => {
    await markNotificationHandled(top.id);
    setDismissed((s) => new Set(s).add(top.id));
    onRefresh();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 p-4 border-l-4 border-l-red-500 border-y border-r border-pro-border bg-red-500/10 rounded-r-lg text-white font-sans shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-red-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Critical Alert
          </div>
          <p className="text-sm mt-2 text-gray-200">
            {top.reason}
          </p>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {new Date(top.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
