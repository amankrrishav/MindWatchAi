import { api } from "./client";

export async function fetchUserRisk() {
  const res = await api.get("/predict/risk/me");
  return res.data;
}
