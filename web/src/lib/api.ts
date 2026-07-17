import type { CheckInInput, CreateUserInput, User, UserPlan } from "./types";

// Client-side helpers for the ReBound API routes.

async function parse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export function apiCreateUser(input: CreateUserInput): Promise<User> {
  return fetch("/api/createUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((r) => parse<User>(r));
}

export function apiSubmitCheckIn(userId: string, input: CheckInInput) {
  return fetch(`/api/updatePlan/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((r) => parse<unknown>(r));
}

export function apiFetchUserPlan(userId: string): Promise<UserPlan> {
  return fetch(`/api/userPlan/${userId}`).then((r) => parse<UserPlan>(r));
}
