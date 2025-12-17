import api from "./client";

export async function fetchUserAlerts(userId) {
  const res = await api.get(`/predict/alerts/${userId}`);
  return res.data;
}