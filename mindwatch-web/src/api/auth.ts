import { api } from "./client";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", { email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

