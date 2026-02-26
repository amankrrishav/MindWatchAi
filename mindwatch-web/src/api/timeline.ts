import { api } from "./client";

export interface TimelineEntry {
    timestamp: string;
    source: string;
    severity: string;
    risk_level: string;
    confidence: number;
    reasons: string[];
}

export interface UserTimelineResponse {
    user_id: string;
    timeline: TimelineEntry[];
}

export async function fetchTimeline(): Promise<UserTimelineResponse> {
    const res = await api.get("/predict/timeline/me");
    return res.data;
}
