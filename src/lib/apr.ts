import { NormalizedOffer, RawOffer } from "./types"

/**
 * Compute a rough-but-consistent APR and total repay for hackathon demo.
 * Assumptions:
 * - Simple interest (no compounding) over termDays.
 * - Annualization uses 365 days.
 * - Upfront % fees are taken at disbursement (reduce received cash but don't change principal owed),
 *   but for user clarity we still show total repay on principal + interest + any end/usage fees.
 */
export function normalizeOffer(
  offer: RawOffer,
  amount: number,
  termDays: number
): NormalizedOffer | null {
  if (
    (offer.minAmount && amount < offer.minAmount) ||
    (offer.maxAmount && amount > offer.maxAmount) ||
    (offer.minDays && termDays < offer.minDays) ||
    (offer.maxDays && termDays > offer.maxDays)
  )
    return null

  const upfrontPct = offer.upfrontFeePct ?? 0
  const monthlyRate = offer.monthlyRatePct ?? 0
  const dailyRate = offer.dailyRatePct ?? 0

  // choose interest input: daily preferred if present, else derive from monthly
  const dailySimpleRate = dailyRate || (monthlyRate ? monthlyRate / 30 : 0)

  const interest = amount * dailySimpleRate * termDays

  const upfrontFees = amount * upfrontPct + (offer.disbursementFlat ?? 0)
  const usageFees = offer.usageFeeFlat ?? 0
  const closingFees = offer.closingFlat ?? 0

  const totalRepay = Math.max(0, amount) + interest + usageFees + closingFees

  // Effective cash received after upfront fees (used for APR intuition)
  const netProceeds = amount - upfrontFees
  const financeCharge = totalRepay - netProceeds

  // APR (simple annualized): (financeCharge / netProceeds) * (365 / termDays) * 100
  const aprPct =
    netProceeds > 0 && termDays > 0
      ? (financeCharge / netProceeds) * (365 / termDays) * 100
      : 0

  return {
    id: offer.id,
    provider: offer.provider,
    rail: offer.rail,
    aprPct,
    totalRepay,
    breakdown: {
      principal: amount,
      interest,
      upfrontFees,
      usageFees,
      closingFees,
    },
    feeClauses: offer.feeClauses,
  }
}

export function rankOffers(
  normalized: (NormalizedOffer | null)[]
): NormalizedOffer[] {
  return normalized
    .filter(Boolean)
    .sort((a, b) => a!.aprPct - b!.aprPct) as NormalizedOffer[]
}
