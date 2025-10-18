export type Intent =
  | "explain_apr"
  | "compare_offers"
  | "fee_explain"
  | "eligibility"
  | "bank_vs_p2p"
  | "how_p2p_works"
  | "policy_privacy"
  | "glossary"
  | "smalltalk"
  | "unknown"

export interface Slots {
  amount?: number | null
  termDays?: number | null
  offerIds?: string[] // normalized
  rail?: "BANK" | "P2P" | null
  feeName?: string | null
  language?: "uz" | "ru" | "en"
}

export interface IntentResult {
  intent: Intent
  slots: Slots
  confidence: number // 0..1 simple heuristic
  reasons: string[] // debug/explainable
}

