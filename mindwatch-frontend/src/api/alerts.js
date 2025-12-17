import api from "./client";

export async function fetchUserAlerts(userId) {
  const res = await api.get(`/predict/alerts/${userId}`);
  return res.data;
}

export async function acknowledgeAlert(alertId) {
  const res = await api.patch(
    `/predict/alerts/${alertId}/acknowledge`
  );
  return res.data;
}

export async function resolveAlert(alertId) {
  const res = await api.patch(
    `/predict/alerts/${alertId}/resolve`
  );
  return res.data;
}