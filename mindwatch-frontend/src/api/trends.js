import api from "./client";

export async function fetchUserTrends(userId) {
  const res = await api.get(`/predict/trends/${userId}`);
  return res.data;
}