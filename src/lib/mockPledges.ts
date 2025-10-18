import { LenderPledge } from "./types"

// deterministic pseudo-random (seeded)
function rng(seed: number) {
  let x = Math.sin(seed) * 10000
  return () => {
    x = Math.sin(x) * 10000
    return x - Math.floor(x)
  }
}

export function generatePledges(
  target: number,
  termDays: number,
  score: number,
  dailyRatePct: number
): Omit<LenderPledge, "id" | "createdAt">[] {
  const r = rng(target + termDays + score)
  const names = [
    "Alpha Lend",
    "BlueBrick",
    "Cosmo Capital",
    "Delta Micro",
    "Echo Pool",
    "Faro Fund",
  ]
  const pledges: Omit<LenderPledge, "id" | "createdAt">[] = []
  let sum = 0
  let i = 0
  while (sum < target && i < 12) {
    const remain = target - sum
    const slice = Math.max(
      50_000,
      Math.min(remain, Math.floor(remain * (0.25 + r() * 0.35)))
    )
    const name = names[i % names.length]
    const jitter = (r() - 0.5) * 0.0002 // +/- 0.02% daily
    pledges.push({
      lenderName: name,
      amount: slice,
      rateDailyPct: Math.max(0, dailyRatePct + jitter),
    })
    sum += slice
    i++
  }
  return pledges
}
