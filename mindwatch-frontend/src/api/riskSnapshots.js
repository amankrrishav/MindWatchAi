import api from "./client";

export async function fetchRiskSnapshots(userId) {
  const res = await api.get(`/predict/risk/snapshots/${userId}`);
  return res.data;
}