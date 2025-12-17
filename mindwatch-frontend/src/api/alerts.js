import api from "./client";

export async function fetchUserAlerts(userId) {
  const res = await api.get(`/predict/alerts/${userId}`);

  return res.data
    .filter(a => a.risk_level && a.risk_level !== "string")
    .map(a => ({
      id: a.id,
      risk_level: a.risk_level,
      confidence: a.confidence,
      reasons: a.reasons
        ? a.reasons
        : a.reason
        ? [a.reason]
        : [],
      created_at: a.created_at,
      status: a.acknowledged ? "resolved" : "new",
    }));
}