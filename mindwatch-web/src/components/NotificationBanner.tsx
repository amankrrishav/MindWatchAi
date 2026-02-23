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
    <div className="w-full max-w-3xl mx-auto mb-4 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 text-red-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">Important</div>
          <p className="text-sm mt-1">{top.reason}</p>
          <p className="text-xs text-red-700 mt-2">{new Date(top.created_at).toLocaleString()}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
