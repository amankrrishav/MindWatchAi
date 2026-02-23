import { api } from "./client";

export interface NotificationIntent {
  id: string;
  intent_type: string;
  priority: string;
  reason: string;
  source: string;
  created_at: string;
}

export async function fetchUnreadNotifications(): Promise<NotificationIntent[]> {
  const res = await api.get("/notifications");
  return res.data;
}

export async function markNotificationHandled(intentId: string): Promise<void> {
  await api.patch(`/notifications/${intentId}/handled`);
}
