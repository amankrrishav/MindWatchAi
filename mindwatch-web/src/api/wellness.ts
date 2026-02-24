import { api } from "./client";

export interface CheckInPayload {
  mood: number;
  sleep_quality: number;
  energy: number;
  anxiety: number;
  social: number;
  focus: number;
  appetite: number;
  notes?: string;
}

export interface CheckInRecord extends CheckInPayload {
  id: number;
  user_id: string;
  wellness_score: number;
  created_at: string;
}

export interface WellnessScore {
  user_id: string;
  wellness_score: number | null;
  risk_level: string;
  confidence: number;
  reasons: { factor: string; impact: string }[];
  signals: Record<string, number> | null;
}

export interface ConsentSettings {
  user_id: string;
  data_collection: boolean;
  research_use: boolean;
  ai_analysis: boolean;
  notifications_ok: boolean;
  updated_at?: string;
}

export async function submitCheckIn(payload: CheckInPayload): Promise<CheckInRecord> {
  const res = await api.post("/wellness/checkin", payload);
  return res.data;
}

export async function fetchWellnessScore(): Promise<WellnessScore> {
  const res = await api.get("/wellness/score");
  return res.data;
}

export async function fetchCheckInHistory(): Promise<CheckInRecord[]> {
  const res = await api.get("/wellness/history");
  return res.data;
}

export async function fetchConsent(): Promise<ConsentSettings> {
  const res = await api.get("/wellness/consent");
  return res.data;
}

export async function updateConsent(settings: Omit<ConsentSettings, "user_id" | "updated_at">): Promise<ConsentSettings> {
  const res = await api.put("/wellness/consent", settings);
  return res.data;
}
