import api from "./client";

export async function fetchExplanation(userId) {
  const res = await api.get(`/predict/explanation/${userId}`);
  return res.data;
}