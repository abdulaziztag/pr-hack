import type { CompareInput, CompareOutput } from "./types"

export function compareOffers(input: CompareInput): CompareOutput {
  const offers = [...(input.offers || [])]
  offers.sort((a, b) => {
    const aa = a.aprPct ?? 1e9
    const bb = b.aprPct ?? 1e9
    if (aa !== bb) return aa - bb
    const ta = a.totalRepay ?? 1e12
    const tb = b.totalRepay ?? 1e12
    return ta - tb
  })
  const ranked = input.top ? offers.slice(0, input.top) : offers
  const deltas =
    ranked.length >= 2
      ? [
          {
            a: ranked[0].id,
            b: ranked[1].id,
            diffAprPct: (ranked[1].aprPct ?? 0) - (ranked[0].aprPct ?? 0),
            diffTotal: (ranked[1].totalRepay ?? 0) - (ranked[0].totalRepay ?? 0),
          },
        ]
      : []
  const notes = ["Ranked by APR, tie-break by total repay."]
  return { ranked, deltas, notes }
}

