const K = "fairlend.dismissed.v1";
type Key = "safety_banner" | "compliance_ribbon" | "disclosures_card";

function read(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(K) || "{}");
  } catch {
    return {};
  }
}

function write(v: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(K, JSON.stringify(v));
}

export function isDismissed(key: Key): boolean {
  return !!read()[key];
}

export function dismiss(key: Key) {
  const m = read();
  m[key] = true;
  write(m);
}

export function clearAllDismissed() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(K);
}

export type DismissKey = Key;

