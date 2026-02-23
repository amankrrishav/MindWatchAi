import { API_BASE, USER_ID } from "./constants";

const headers = { "X-User-Id": USER_ID };

export interface QuestionCard {
  id: string;
  title: string;
  question: string;
  answers: { key: string; label: string }[];
  allow_skip: boolean;
}

export async function fetchNextQuestion(): Promise<QuestionCard | null> {
  const res = await fetch(`${API_BASE}/api/questions/next`, { headers });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function submitAnswer({ questionId, answerKey }: { questionId: string; answerKey: string }) {
  const res = await fetch(`${API_BASE}/api/questions/${questionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ answer_key: answerKey }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
}

export async function skipQuestion({ questionId }: { questionId: string }) {
  const res = await fetch(`${API_BASE}/api/questions/${questionId}/skip`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to skip question");
}
