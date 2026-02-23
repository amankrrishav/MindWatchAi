import { api } from "./client";
import { USER_ID } from "./constants";

export async function fetchUserTrends() {
  const res = await api.get(`/predict/trends/${USER_ID}`);
  return res.data;
}
