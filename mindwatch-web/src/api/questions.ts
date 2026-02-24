import { API_BASE } from "./constants";

export interface QuestionCard {
  id: string;
  title: string;
  question: string;
  answers: { key: string; label: string }[];
  allow_skip: boolean;
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("mw_access_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchNextQuestion(): Promise<QuestionCard | null> {
  const res = await fetch(`${API_BASE}/api/questions/next`, {
    headers: authHeaders(),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function submitAnswer({ questionId, answerKey }: { questionId: string; answerKey: string }) {
  const res = await fetch(`${API_BASE}/api/questions/${questionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ answer_key: answerKey }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
}

export async function skipQuestion({ questionId }: { questionId: string }) {
  const res = await fetch(`${API_BASE}/api/questions/${questionId}/skip`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to skip question");
}
