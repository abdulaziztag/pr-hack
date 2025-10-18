import { saveVersion, TariffVersion, listVersions } from "./tariffsStore"
import { MOCK_OFFERS } from "./mockOffers"
import { logAudit } from "./audit"

export interface DemoPreset {
  name: string
  applicant: {
    amount: number
    termDays: number
    monthlyIncome: number
    employmentStatus: "employed" | "self" | "student" | "unemployed"
    hasDelinquency: boolean
    agreeToTerms: boolean
  }
}

export const PRESETS: DemoPreset[] = [
  {
    name: "Baseline — 3.5M UZS / 30 days / employed",
    applicant: {
      amount: 3_500_000,
      termDays: 30,
      monthlyIncome: 6_000_000,
      employmentStatus: "employed",
      hasDelinquency: false,
      agreeToTerms: true,
    },
  },
  {
    name: "Student — 1.2M / 20 days",
    applicant: {
      amount: 1_200_000,
      termDays: 20,
      monthlyIncome: 2_500_000,
      employmentStatus: "student",
      hasDelinquency: false,
      agreeToTerms: true,
    },
  },
  {
    name: "High Amount — 10M / 60 days / self-employed",
    applicant: {
      amount: 10_000_000,
      termDays: 60,
      monthlyIncome: 8_000_000,
      employmentStatus: "self",
      hasDelinquency: false,
      agreeToTerms: true,
    },
  },
]

export function seedTariffsIfEmpty() {
  const existing = listVersions()
  if (existing.length > 0) {
    // Already seeded
    return
  }

  const version: TariffVersion = {
    id: "tv_seed",
    provider: "Seed Providers",
    rail: "BANK",
    createdAt: Date.now(),
    notes: "Seeded mock offers for demo",
    rawText: "Seeded from MOCK_OFFERS",
    offers: MOCK_OFFERS,
  }

  saveVersion(version)

  try {
    logAudit("SEED", {
      offers: MOCK_OFFERS.length,
    })
  } catch {
    // Ignore audit errors
  }
}

