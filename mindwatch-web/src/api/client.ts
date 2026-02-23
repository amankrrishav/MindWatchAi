import axios from "axios";
import { API_BASE, USER_ID } from "./constants";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-User-Id": USER_ID,
  },
});
