import { api } from "./client";

export async function fetchUserAlerts() {
  const res = await api.get("/predict/alerts/me");
  return res.data;
}

export async function acknowledgeAlert(alertId: number) {
  const res = await api.patch(`/predict/alerts/${alertId}/acknowledge`);
  return res.data;
}

export async function resolveAlert(alertId: number) {
  const res = await api.patch(`/predict/alerts/${alertId}/resolve`);
  return res.data;
}
