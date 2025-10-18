export interface AuditEntry {
  ts: number
  session: string
  intent: string
  redacted: boolean
  flags: string[]
  promptChars: number
  answerChars?: number
  durationMs?: number
  ok: boolean
}

const BUF: AuditEntry[] = []
const MAX = 300

export function pushAudit(e: AuditEntry) {
  BUF.push(e)
  if (BUF.length > MAX) BUF.shift()
}

export function readAudit(): AuditEntry[] {
  return BUF.slice().reverse()
}

