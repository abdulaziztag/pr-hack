import type { EventName, EventPayload } from "./types";

function sessionId(): string {
  try {
    const k = "fl.session";
    const x = sessionStorage.getItem(k);
    if (x) return x;
    const y = "S" + Math.random().toString(36).slice(2);
    sessionStorage.setItem(k, y);
    return y;
  } catch {
    return "S-anon";
  }
}

export function track(name: EventName, meta?: EventPayload["meta"]) {
  const payload: EventPayload = {
    name,
    ts: Date.now(),
    session: sessionId(),
    meta,
  };
  // fire-and-forget; local POST
  fetch("/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Fail silently
  });
}

