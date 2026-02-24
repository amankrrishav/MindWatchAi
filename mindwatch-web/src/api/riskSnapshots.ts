import { api } from "./client";

export async function fetchRiskSnapshots() {
  const res = await api.get("/predict/risk/snapshots/me");
  return res.data;
}
