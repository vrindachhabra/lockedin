import type { DashboardPayload, Placement, Task, User, WorkspaceConfig } from "@/types";

const getApiUrl = () => {
  if (import.meta.env.DEV) return "http://localhost:8080";
  const url = import.meta.env.VITE_API_URL || "";
  return url || "https://lockedin-3ik2.onrender.com";
};
const API_URL = getApiUrl();
const TOKEN_KEY = "lockedin.token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type AuthResponse = {
  token: string;
  user: User;
};

export const authToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authToken.get();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(body.message ?? "Something went wrong", response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<User>("/api/auth/me"),
  dashboard: () => request<DashboardPayload>("/api/dashboard"),
  tasks: {
    list: () => request<Task[]>("/api/tasks"),
    create: (payload: Omit<Task, "id">) => request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Task>) =>
      request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/api/tasks/${id}`, { method: "DELETE" })
  },
  placements: {
    list: () => request<Placement[]>("/api/placements"),
    create: (payload: Omit<Placement, "id">) =>
      request<Placement>("/api/placements", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Placement>) =>
      request<Placement>(`/api/placements/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/api/placements/${id}`, { method: "DELETE" })
  },
  workspaces: {
    list: () => request<WorkspaceConfig[]>("/api/workspaces"),
    create: (prompt: string) =>
      request<WorkspaceConfig>("/api/workspaces", { method: "POST", body: JSON.stringify({ prompt }) }),
    refine: (id: string, instruction: string, current: WorkspaceConfig) =>
      request<WorkspaceConfig>(`/api/workspaces/${id}/refine`, {
        method: "POST",
        body: JSON.stringify({ instruction, current })
      }),
    update: (id: string, payload: Partial<WorkspaceConfig>) =>
      request<WorkspaceConfig>(`/api/workspaces/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/api/workspaces/${id}`, { method: "DELETE" })
  }
};
