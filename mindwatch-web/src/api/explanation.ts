import { api } from "./client";

export interface ExplanationResponse {
    user_id: string;
    risk_level: string;
    confidence: number;
    tone: string;
    summary: string;
    details: string[];
}

export async function fetchExplanation(): Promise<ExplanationResponse> {
    const res = await api.get("/predict/explanation/me");
    return res.data;
}
