import { api, setAuthToken, writeStoredToken } from "./api";
import type { User } from "../types";

type AuthResponse = { token: string; user: User };

export async function register(data: { email: string; password: string; name?: string }): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  writeStoredToken(res.data.token);
  setAuthToken(res.data.token);
  return res.data;
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  writeStoredToken(res.data.token);
  setAuthToken(res.data.token);
  return res.data;
}

export function logout() {
  writeStoredToken(null);
  setAuthToken(null);
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const res = await api.post("/auth/change-password", data);
  return res.data;
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<User>("/users/me");
  return res.data;
}

export async function updateMe(
  data: Partial<Pick<User, "email" | "name" | "currency" | "timezone" | "weekStartsOn">>
): Promise<User> {
  const res = await api.patch<User>("/users/me", data);
  return res.data;
}

export async function deleteMe(): Promise<void> {
  await api.delete("/users/me");
}
