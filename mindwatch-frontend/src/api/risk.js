import api from "./client";

export async function fetchUserRisk(userId) {
  const response = await api.get(`/predict/risk/${userId}`);
  return response.data;
}