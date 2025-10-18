import { PRESETS } from "./seed"
import { computeScore } from "./scoring"
import { evaluateEligibility } from "./eligibility"
import { MOCK_OFFERS } from "./mockOffers"
import { normalizeOffer } from "./apr"
import {
  createBorrowRequest,
  createEscrowForRequest,
  addPledge,
  releaseFunds,
  setConditions,
} from "./escrow"
import { generatePledges } from "./mockPledges"
import { incr } from "./analytics"
import { Applicant, RawOffer, NormalizedOffer } from "./types"

export interface JudgeResult {
  applicant: {
    score: number
    bucket: "A" | "B" | "C" | "D"
    amount: number
    termDays: number
    monthlyIncome: number
  }
  eligible: {
    provider: string
    rail: "BANK" | "P2P"
    apr: number
    total: number
  }[]
  ineligible: { provider: string; reason: string }[]
  escrow?: {
    id: string
    status: string
    target: number
    funded: number
    pledges: number
  }
}

export function runJudgePreset(presetIndex = 0): JudgeResult {
  const p = PRESETS[presetIndex] ?? PRESETS[0]
  const { score, bucket } = computeScore(p.applicant)

  // Persist intake like the UI would
  const applicantData: Applicant = {
    ...p.applicant,
    score,
    bucket,
  }

  if (typeof window !== "undefined") {
    sessionStorage.setItem("fairlend.intake", JSON.stringify(applicantData))
  }

  // OFFERS normalize + eligibility
  const normalized = MOCK_OFFERS.map((o) => ({
    raw: o,
    norm: normalizeOffer(o, p.applicant.amount, p.applicant.termDays),
  })).filter((x) => !!x.norm) as {
    raw: RawOffer
    norm: NormalizedOffer
  }[]

  const eligible: JudgeResult["eligible"] = []
  const ineligible: JudgeResult["ineligible"] = []

  normalized.forEach(({ raw, norm }) => {
    const elig = evaluateEligibility(raw, applicantData)
    if (elig.eligible) {
      eligible.push({
        provider: norm.provider || "Unknown",
        rail: norm.rail || "BANK",
        apr: Number(norm.aprPct?.toFixed(1) || 0),
        total: Math.round(norm.totalRepay || 0),
      })
    } else {
      ineligible.push({
        provider: norm.provider || "Unknown",
        reason: elig.reasons[0] || "Not eligible",
      })
    }
  })

  // Sort eligible by APR asc
  eligible.sort((a, b) => a.apr - b.apr)

  incr("apply_submits")
  incr("offers_views")

  // If P2P eligible, simulate pledge & escrow
  const p2p = normalized.find((x) => x.raw.rail === "P2P")
  let escrow: JudgeResult["escrow"]

  if (p2p) {
    const elig = evaluateEligibility(p2p.raw, applicantData)
    if (elig.eligible) {
      incr("p2p_posts")

      const req = createBorrowRequest(
        p.applicant.amount,
        p.applicant.termDays,
        score
      )
      const esc = createEscrowForRequest(req)

      const pledges = generatePledges(
        p.applicant.amount,
        p.applicant.termDays,
        score,
        0.001
      )

      pledges.forEach((pl) =>
        addPledge(esc.id, {
          lenderName: pl.lenderName,
          amount: pl.amount,
          rateDailyPct: pl.rateDailyPct,
        })
      )

      incr("p2p_funded")

      // Set all conditions to true
      setConditions(esc.id, {
        borrowerConfirmedReceipt: true,
        coolingOffComplete: true,
        noDispute: true,
      })

      // Release funds
      releaseFunds(esc.id)
      incr("escrow_release")

      // Store P2P intent
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "fairlend.p2p.intent",
          JSON.stringify({
            amount: p.applicant.amount,
            termDays: p.applicant.termDays,
            score,
            offerId: p2p.raw.id,
          })
        )
      }

      escrow = {
        id: esc.id,
        status: "RELEASED",
        target: p.applicant.amount,
        funded: p.applicant.amount,
        pledges: pledges.length,
      }
    }
  }

  return {
    applicant: {
      score,
      bucket,
      amount: p.applicant.amount,
      termDays: p.applicant.termDays,
      monthlyIncome: p.applicant.monthlyIncome,
    },
    eligible,
    ineligible,
    escrow,
  }
}

