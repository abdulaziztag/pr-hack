// Note: Applicant is defined in types but not directly used in this file

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Deterministic weekend-grade scoring (no PII, hackathon-safe).
 * Base 600, +/- rule points; returns score and bucket.
 */
export function computeScore(a: {
  amount: number
  termDays: number
  monthlyIncome: number
  employmentStatus: "employed" | "self" | "student" | "unemployed"
  hasDelinquency: boolean
  agreeToTerms: boolean
}): { score: number; bucket: "A" | "B" | "C" | "D" } {
  let s = 600

  // Affordability ratios
  const amtToIncome =
    a.monthlyIncome > 0 ? a.amount / a.monthlyIncome : Infinity
  if (amtToIncome <= 0.5) s += 60
  else if (amtToIncome <= 1.0) s += 30
  else if (amtToIncome <= 1.5) s += 10
  else if (amtToIncome <= 2.0) s -= 20
  else s -= 60

  // Tenor
  if (a.termDays <= 30) s += 30
  else if (a.termDays <= 60) s += 10
  else s -= 20

  // Employment
  const empPts =
    ({ employed: 40, self: 20, student: -10, unemployed: -40 } as const)[
      a.employmentStatus
    ] ?? 0
  s += empPts

  // Behavior flags
  if (a.hasDelinquency) s -= 80
  if (a.agreeToTerms) s += 10

  // Small-amount bonus to reflect lower risk concentration
  if (a.amount < 2_000_000) s += 20

  const score = clamp(Math.round(s), 300, 900)
  const bucket: "A" | "B" | "C" | "D" =
    score >= 720 ? "A" : score >= 620 ? "B" : score >= 520 ? "C" : "D"

  return { score, bucket }
}

