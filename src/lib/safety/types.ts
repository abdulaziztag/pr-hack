export type SafetyFlag =
  | "pii_redacted"
  | "blocked_prompt_injection"
  | "blocked_unsafe_content"
  | "rate_limited"
  | "circuit_open"

export interface SafetyReport {
  flags: SafetyFlag[]
  notes: string[]
}

