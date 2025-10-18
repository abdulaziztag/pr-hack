import type { DemoUser } from "./types";

const KEY = "fl.auth.v1";
const COOKIE = "fl-role";

export function loadUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(u: DemoUser | null): void {
  try {
    if (u) {
      localStorage.setItem(KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // silent fail
  }

  // Mirror role to cookie for server-side reads if needed
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE}=${encodeURIComponent(u?.role || "guest")}; path=/; max-age=2592000`;
  }
}



