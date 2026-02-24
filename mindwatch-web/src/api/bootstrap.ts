import { api } from "./client";

/**
 * Bootstrap: submit a minimal PHQ-9 to create initial PHQ9Analysis.
 * Enables orchestration and monitoring for new users.
 */
export async function bootstrapFirstAssessment() {
  const answers: Record<string, number> = {};
  for (let i = 1; i <= 9; i++) {
    answers[`q${i}`] = 0;
  }
  await api.post("/predict/phq9/analyze", {
    answers,
    user_id: "me",
    session_id: `bootstrap-${Date.now()}`,
  });
}
