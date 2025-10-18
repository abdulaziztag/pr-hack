import { Applicant, RawOffer } from "./types"

export interface EligibilityResult {
  eligible: boolean
  reasons: string[]
}

export function evaluateEligibility(
  offer: RawOffer,
  a: Applicant
): EligibilityResult {
  const r: string[] = []
  const e = offer.eligibility ?? {}

  // Amount/term window from offer itself
  if (offer.minAmount && a.amount < offer.minAmount) {
    r.push(
      `Amount below provider minimum (${offer.minAmount.toLocaleString()} UZS).`
    )
  }
  if (offer.maxAmount && a.amount > offer.maxAmount) {
    r.push(
      `Amount above provider maximum (${offer.maxAmount.toLocaleString()} UZS).`
    )
  }
  if (offer.minDays && a.termDays < offer.minDays) {
    r.push(`Term shorter than minimum (${offer.minDays} days).`)
  }
  if (offer.maxDays && a.termDays > offer.maxDays) {
    r.push(`Term longer than maximum (${offer.maxDays} days).`)
  }

  if (e.minScore && a.score < e.minScore) {
    r.push(`Score ${a.score} is below required ${e.minScore}.`)
  }

  if (e.maxAmtToIncome && a.monthlyIncome > 0) {
    const ratio = a.amount / a.monthlyIncome
    if (ratio > e.maxAmtToIncome) {
      r.push(
        `Requested amount exceeds ${e.maxAmtToIncome}× monthly income (your ratio ${ratio.toFixed(2)}×).`
      )
    }
  }

  if (e.minIncome && a.monthlyIncome < e.minIncome) {
    r.push(
      `Monthly income below minimum (${e.minIncome.toLocaleString()} UZS).`
    )
  }

  if (
    e.allowedEmployment &&
    !e.allowedEmployment.includes(a.employmentStatus)
  ) {
    r.push(`Employment status not supported for this product.`)
  }

  if (e.disallowDelinquency && a.hasDelinquency) {
    r.push(`Recent delinquency not allowed for this product.`)
  }

  return { eligible: r.length === 0, reasons: r }
}

