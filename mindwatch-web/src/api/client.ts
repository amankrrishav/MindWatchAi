import axios from "axios";
import { API_BASE } from "./constants";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("mw_access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
