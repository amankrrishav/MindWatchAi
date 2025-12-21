import api from "./client";
import { USER_ID } from "./constants";

export async function fetchRiskSnapshots() {
  const res = await api.get(`/predict/risk/snapshots/${USER_ID}`);
  return res.data;
}