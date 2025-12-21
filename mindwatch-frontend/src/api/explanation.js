import api from "./client";

/**
 * Fetch explanation for current user
 * Source: Risk Engine
 */
export async function fetchExplanation() {
  const res = await api.get("/predict/explanation/test-user-uuid");
  return res.data;
}