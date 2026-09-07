import type {
  CheckinResponse,
  Habit,
  HeatmapData,
  Stats,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchHabits(tz?: number) {
  return request<Habit[]>(`/habits${tz != null ? `?tz=${tz}` : ""}`);
}

export function createHabit(input: { name: string; color: string; emoji: string }) {
  return request<Habit>("/habits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteHabit(id: number) {
  return request<void>(`/habits/${id}`, { method: "DELETE" });
}

export function toggleCheckin(id: number, date: string, tz?: number) {
  return request<CheckinResponse>(`/habits/${id}/checkin`, {
    method: "POST",
    body: JSON.stringify({ date, tz }),
  });
}

export function fetchHeatmap(tz?: number) {
  return request<HeatmapData>(`/heatmap?days=371${tz != null ? `&tz=${tz}` : ""}`);
}

export function fetchStats(tz?: number) {
  return request<Stats>(`/stats${tz != null ? `?tz=${tz}` : ""}`);
}