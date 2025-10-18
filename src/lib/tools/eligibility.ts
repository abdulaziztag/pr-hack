import type { EligibilityInput, EligibilityOutput } from "./types"

export function eligibilityCheck({
  intake,
}: EligibilityInput): EligibilityOutput {
  const amount = intake.amount ?? 0
  const term = intake.termDays ?? 0
  const reasons: string[] = []
  if (amount < 100_000) reasons.push("Minimum amount is 100,000 UZS.")
  if (term < 7) reasons.push("Minimum term is 7 days.")
  if (amount > 100_000_000)
    reasons.push("Maximum amount is 100,000,000 UZS for demo.")
  if (term > 365) reasons.push("Maximum term is 365 days for demo.")
  const ok = reasons.length === 0
  const hints = ok
    ? ["Proceed to compare offers."]
    : ["Adjust amount/term and try again."]
  return { ok, reasons, hints }
}

