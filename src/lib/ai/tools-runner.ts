import { calcAPR } from "@/lib/tools/calc-apr"
import { compareOffers } from "@/lib/tools/compare"
import { explainFee } from "@/lib/tools/fees"
import { eligibilityCheck } from "@/lib/tools/eligibility"
import { p2pPreview } from "@/lib/tools/p2p"
import { navigate } from "@/lib/tools/navigate"
import type { ToolResult, OfferInput } from "@/lib/tools/types"
import type { IntentResult } from "./intent-types"
import { buildOffersSnapshot } from "./offers-context"

export function runToolsForIntent(ir: IntentResult): ToolResult[] {
  const out: ToolResult[] = []
  const snap = buildOffersSnapshot()
  const { amount, termDays, feeName, rail } = ir.slots || {}

  const offers: OfferInput[] = (snap.offers || []).map((o) => ({
    id: o.id,
    provider: o.provider,
    rail: o.rail,
    aprPct: o.aprPct,
    totalRepay: o.totalRepay,
    termDays: o.termDays,
    fees: [], // extend later if stored
  }))

  switch (ir.intent) {
    case "compare_offers": {
      out.push({
        tool: "compareOffers",
        result: compareOffers({ offers, top: 3 }),
      })
      break
    }
    case "fee_explain": {
      if (feeName)
        out.push({
          tool: "feeExplain",
          result: explainFee({ name: feeName, offer: offers[0] }),
        })
      break
    }
    case "eligibility": {
      out.push({
        tool: "eligibilityCheck",
        result: eligibilityCheck({ intake: snap.intake, offer: offers[0] }),
      })
      break
    }
    case "bank_vs_p2p": {
      // compare top 2 plus p2p preview
      out.push({
        tool: "compareOffers",
        result: compareOffers({ offers, top: 2 }),
      })
      if (snap.intake.amount && snap.intake.termDays) {
        out.push({
          tool: "p2pPreview",
          result: p2pPreview({
            amount: snap.intake.amount,
            termDays: snap.intake.termDays,
          }),
        })
      }
      break
    }
    case "explain_apr": {
      if (amount && termDays) {
        out.push({
          tool: "calcAPR",
          result: calcAPR({ amount, termDays, fees: [] }),
        })
      }
      break
    }
    case "how_p2p_works": {
      if (snap.intake.amount && snap.intake.termDays) {
        out.push({
          tool: "p2pPreview",
          result: p2pPreview({
            amount: snap.intake.amount,
            termDays: snap.intake.termDays,
          }),
        })
      }
      break
    }
    default:
      // no-op
      break
  }

  // Small UX navigate hint (e.g., filter by rail)
  if (rail)
    out.push({
      tool: "navigate",
      result: navigate({ action: "filterRail", arg: rail }),
    })

  return out
}

