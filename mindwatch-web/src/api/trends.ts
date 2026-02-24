import { api } from "./client";

export async function fetchUserTrends() {
  const res = await api.get("/predict/trends/me");
  return res.data;
}
