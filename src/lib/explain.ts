import { CorpusEntry } from "./retriever"
import { NormalizedOffer } from "./types"

/** Turn a corpus entry into a short, user-facing explanation string. */
export function toPlainExplanation(e: CorpusEntry): string {
  // Keep it short and lay terms; use e.title + e.clause; avoid legalese.
  return `${e.title}: ${e.clause}`
}

/** Build a short "why APR looks like this" sentence using a normalized offer. */
export function explainApr(offer: NormalizedOffer, termDays: number): string {
  const parts: string[] = []

  if (offer.breakdown.upfrontFees > 0) {
    const upfrontStr = Math.round(offer.breakdown.upfrontFees).toLocaleString()
    parts.push(`upfront fees of ${upfrontStr} UZS reduce net proceeds`)
  }

  if (offer.breakdown.interest > 0) {
    parts.push(`interest over the ${termDays}-day term`)
  }

  if (offer.breakdown.usageFees > 0) {
    parts.push(`usage fees`)
  }

  if (offer.breakdown.closingFees > 0) {
    parts.push(`closing fees at repayment`)
  }

  const list = parts.filter(Boolean).join(", ")

  return list
    ? `APR reflects ${list}, annualized for comparison.`
    : `APR is annualized from the finance charge and net proceeds for comparison.`
}

