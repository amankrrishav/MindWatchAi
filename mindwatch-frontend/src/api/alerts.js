import api from "./client";
import { USER_ID } from "./constants";

export async function fetchUserAlerts() {
  const res = await api.get(`/predict/alerts/${USER_ID}`);
  return res.data;
}

export async function acknowledgeAlert(alertId) {
  const res = await api.patch(`/predict/alerts/${alertId}/acknowledge`);
  return res.data;
}

export async function resolveAlert(alertId) {
  const res = await api.patch(`/predict/alerts/${alertId}/resolve`);
  return res.data;
}