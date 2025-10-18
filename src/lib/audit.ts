import { SAFETY } from "./safety"

const K = "fairlend.audit.v1"

export interface AuditEvent {
  id: string
  t: number // timestamp
  type: string // e.g., "APPLY_SUBMIT", "OFFERS_VIEW", "P2P_POST", "ESCROW_RELEASE"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Record<string, any>
}

const uid = () =>
  `ae_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`

export function readAudit(): AuditEvent[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(sessionStorage.getItem(K) || "[]")
  } catch {
    return []
  }
}

export function writeAudit(events: AuditEvent[]) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(K, JSON.stringify(events))
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logAudit(type: string, payload?: Record<string, any>) {
  const events = readAudit()
  const event: AuditEvent = { id: uid(), t: Date.now(), type, payload }
  events.push(event)
  writeAudit(events)

  // Optional console logging
  if (SAFETY.analyticsEnabled) {
    console.info("[audit]", event)
  }
}

export function resetAudit() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(K)
  }
}

