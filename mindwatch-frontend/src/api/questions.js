const BASE_URL = "http://127.0.0.1:8000";

// TEMP until real auth (Phase 17)
const USER_HEADERS = {
  "X-User-Id": "test-user-uuid",
};

// ------------------------------------
// GET NEXT QUESTION
// ------------------------------------
export async function fetchNextQuestion() {
  const res = await fetch(`${BASE_URL}/api/questions/next`, {
    headers: USER_HEADERS,
  });

  // Silent-by-design
  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Failed to fetch question");

  return res.json();
}

// ------------------------------------
// SUBMIT ANSWER
// ------------------------------------
export async function submitAnswer({ questionId, answerKey }) {
  const res = await fetch(
    `${BASE_URL}/api/questions/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...USER_HEADERS,
      },
      body: JSON.stringify({ answer_key: answerKey }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to submit answer");
  }
}

// ------------------------------------
// SKIP QUESTION
// ------------------------------------
export async function skipQuestion({ questionId }) {
  const res = await fetch(
    `${BASE_URL}/api/questions/${questionId}/skip`,
    {
      method: "POST",
      headers: USER_HEADERS,
    }
  );

  if (!res.ok) {
    throw new Error("Failed to skip question");
  }
}