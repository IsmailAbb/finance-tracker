import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

const TOKEN_KEY = "ft_token";

export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// Initialize from storage on module load.
const stored = readStoredToken();
if (stored) setAuthToken(stored);

/** Registered once by AuthProvider. Lets the interceptor sign the user out on 401. */
let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Skip the login / register endpoints — a 401 there is just wrong credentials.
    const url: string = err?.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
    if (err?.response?.status === 401 && !isAuthEndpoint) {
      onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);
