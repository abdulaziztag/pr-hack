import type { SafetyReport } from "./types"

const INJECTION_HINTS =
  /(ignore (previous|all) instructions|disregard rules|act as system|override system|disable safety)/i
const UNSAFE_REQUESTS =
  /(exploit|malware|bypass|vpn credentials|card number|cvv|ssn)/i

export function safetyGate(
  userText: string,
  intent: string
): SafetyReport & { blocked: boolean } {
  const flags: SafetyReport["flags"] = []
  const notes: string[] = []

  if (INJECTION_HINTS.test(userText)) {
    flags.push("blocked_prompt_injection")
  }
  if (UNSAFE_REQUESTS.test(userText)) {
    flags.push("blocked_unsafe_content")
  }

  // Intent allowlist: only our 10 intents from Prompt 3
  const allow = new Set([
    "explain_apr",
    "compare_offers",
    "fee_explain",
    "eligibility",
    "bank_vs_p2p",
    "how_p2p_works",
    "policy_privacy",
    "glossary",
    "smalltalk",
    "unknown",
  ])
  if (!allow.has(intent as any)) {
    flags.push("blocked_unsafe_content")
  }

  const blocked =
    flags.includes("blocked_prompt_injection") ||
    flags.includes("blocked_unsafe_content")
  return { flags, notes, blocked }
}

