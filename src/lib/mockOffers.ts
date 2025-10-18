import { RawOffer } from "./types"

export const MOCK_OFFERS: RawOffer[] = [
  {
    id: "bank-uzm-30",
    provider: "Bank A Micro",
    rail: "BANK",
    upfrontFeePct: 0.05, // "card transfer fee 5%"
    monthlyRatePct: 0.02,
    feeClauses: [
      {
        label: "5% transfer-to-card",
        kind: "upfront",
        plainMeaning: "5% is deducted when funds are sent to your card.",
        citation: "Tariff 4.2",
      },
      {
        label: "2% per month interest",
        kind: "interest",
        plainMeaning: "Interest accrues daily based on a 2% monthly rate.",
        citation: "Loan terms §3",
      },
    ],
    minAmount: 200_000,
    maxAmount: 30_000_000,
    minDays: 7,
    maxDays: 90,
    eligibility: {
      minScore: 540,
      maxAmtToIncome: 2.0,
      disallowDelinquency: true,
      allowedEmployment: ["employed", "self", "student"],
    },
  },
  {
    id: "bank-slim-0up",
    provider: "Bank B Lite",
    rail: "BANK",
    upfrontFeePct: 0,
    monthlyRatePct: 0.035,
    disbursementFlat: 0,
    feeClauses: [
      {
        label: "0% disbursement fee",
        kind: "upfront",
        plainMeaning: "No fee when funds are sent.",
        citation: "Promo bulletin",
      },
      {
        label: "3.5% per month interest",
        kind: "interest",
        plainMeaning: "Higher interest but no upfront slice.",
        citation: "Public offer",
      },
    ],
    minAmount: 300_000,
    maxAmount: 20_000_000,
    minDays: 10,
    maxDays: 60,
    eligibility: {
      minScore: 580,
      maxAmtToIncome: 2.0,
      disallowDelinquency: true,
      allowedEmployment: ["employed", "self", "student"],
    },
  },
  {
    id: "p2p-flex",
    provider: "FairLend P2P Pool",
    rail: "P2P",
    upfrontFeePct: 0, // we'll charge platform fee on interest side
    dailyRatePct: 0.001, // ~0.1%/day
    usageFeeFlat: 0,
    closingFlat: 0,
    feeClauses: [
      {
        label: "Daily rate ~0.1%",
        kind: "interest",
        plainMeaning: "Interest grows with days you hold the loan.",
        citation: "P2P market quote",
      },
      {
        label: "Escrow simulation only",
        kind: "usage",
        plainMeaning: "For demo we do not move real funds.",
        citation: "Hackathon demo",
      },
    ],
    minAmount: 100_000,
    maxAmount: 15_000_000,
    minDays: 5,
    maxDays: 45,
    eligibility: {
      minScore: 480,
      maxAmtToIncome: 2.5,
      disallowDelinquency: false,
      allowedEmployment: ["employed", "self", "student", "unemployed"],
    },
  },
]
