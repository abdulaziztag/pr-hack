export type Rail = "BANK" | "P2P"

export interface IntakeInput {
  amount?: number
  termDays?: number
}

export interface OfferInput {
  id: string
  provider: string
  rail: Rail
  aprPct?: number // normalized APR % (float, e.g. 38.2)
  totalRepay?: number // UZS
  termDays?: number
  fees?: Array<{ name: string; value: number; unit: "%" | "UZS" }>
}

export interface CalcAprInput {
  amount: number
  termDays: number
  fees: Array<{ name: string; value: number; unit: "%" | "UZS" }>
  upfront?: number // UZS
  rateAnnualPct?: number // optional simple APR seed
}

export interface CalcAprOutput {
  aprPct: number
  totalRepay: number
  schedule: Array<{ day: number; due: number }>
  assumptions: string[]
}

export interface CompareInput {
  offers: OfferInput[]
  top?: number
}

export interface CompareOutput {
  ranked: OfferInput[]
  deltas?: Array<{
    a: string
    b: string
    diffAprPct?: number
    diffTotal?: number
  }>
  notes: string[]
}

export interface FeeExplainInput {
  name: string
  offer?: OfferInput | null
}

export interface FeeExplainOutput {
  name: string
  description: string
  examples?: string[]
}

export interface EligibilityInput {
  intake: IntakeInput
  offer?: OfferInput | null
}

export interface EligibilityOutput {
  ok: boolean
  reasons: string[]
  hints: string[]
}

export interface P2PPreviewInput {
  amount: number
  termDays: number
}

export interface P2PPreviewOutput {
  expectedYieldPct: number // lender net per annum
  escrowSteps: string[]
  simulatedMatchId: string
}

export interface NavigateInput {
  action: "focusOffers" | "openP2P" | "filterRail" | "scrollTo"
  arg?: string
}

export interface NavigateOutput {
  ok: true
}

export type ToolResult =
  | { tool: "calcAPR"; result: CalcAprOutput }
  | { tool: "compareOffers"; result: CompareOutput }
  | { tool: "feeExplain"; result: FeeExplainOutput }
  | { tool: "eligibilityCheck"; result: EligibilityOutput }
  | { tool: "p2pPreview"; result: P2PPreviewOutput }
  | { tool: "navigate"; result: NavigateOutput }

