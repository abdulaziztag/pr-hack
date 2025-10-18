import type { CalcAprInput, CalcAprOutput } from "./types"

export function calcAPR(input: CalcAprInput): CalcAprOutput {
  const { amount, termDays, fees, upfront = 0, rateAnnualPct } = input
  const feeFlat = fees
    .filter((f) => f.unit === "UZS")
    .reduce((s, f) => s + f.value, 0)
  const feePct = fees
    .filter((f) => f.unit === "%")
    .reduce((s, f) => s + f.value, 0)
  const principalNet = Math.max(
    0,
    amount - upfront - feeFlat - (amount * feePct) / 100
  )
  const repay =
    amount +
    (rateAnnualPct ? (amount * (rateAnnualPct / 100) * termDays) / 365 : 0)
  // Guard against divide by zero
  const cashIn = Math.max(1, principalNet)
  const totalRepay = Math.round(repay)
  const aprPct = Math.max(
    0,
    ((totalRepay - cashIn) / cashIn) * (365 / Math.max(1, termDays)) * 100
  )
  const schedule = [{ day: termDays, due: totalRepay }]
  const assumptions = [
    "Single-bullet repayment at term",
    feeFlat ? `Includes flat fees: ${feeFlat} UZS.` : "",
    feePct ? `Includes percent fees: ${feePct}%.` : "",
  ].filter(Boolean)
  return {
    aprPct: Math.round(aprPct * 100) / 100,
    totalRepay,
    schedule,
    assumptions,
  }
}

