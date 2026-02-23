import { api } from "./client";
import { USER_ID } from "./constants";

export async function fetchUserRisk() {
  const res = await api.get(`/predict/risk/${USER_ID}`);
  return res.data;
}
