import type { FeeExplainInput, FeeExplainOutput } from "./types"

const DICT: Record<string, FeeExplainOutput> = {
  transfer: {
    name: "transfer",
    description:
      "Fee charged when transferring the microloan to card/account; often 3–5% upfront.",
    examples: ["5% on transfer equals ~60% simple-annualized on 30 days"],
  },
  "cash-out": {
    name: "cash-out",
    description:
      "ATM/over-the-counter cash withdrawal fee. Avoid if you can pay merchants directly.",
    examples: ["1–2% per cash-out + ATM provider fee"],
  },
  escrow: {
    name: "escrow",
    description:
      "For P2P: funds are held until release conditions are met (e.g., borrower confirmation or time lock).",
  },
  issuance: {
    name: "issuance",
    description:
      "One-time fee charged when the loan is issued. Often a flat amount or percentage of principal.",
    examples: ["50,000 UZS flat or 2% of amount"],
  },
  service: {
    name: "service",
    description:
      "Monthly or one-time service fee for account maintenance or loan processing.",
  },
  penalty: {
    name: "penalty",
    description:
      "Fee charged for late payment or breach of loan terms. Can compound quickly.",
    examples: ["0.1% per day overdue", "Fixed 100,000 UZS penalty"],
  },
  late: {
    name: "late",
    description:
      "Late payment penalty. Usually calculated as a percentage per day or a flat fee.",
    examples: ["0.1% daily penalty on overdue amount"],
  },
}

export function explainFee(input: FeeExplainInput): FeeExplainOutput {
  const key = (input.name || "").toLowerCase().replace(/\s+/g, "-")
  return (
    DICT[key] ?? {
      name: input.name,
      description:
        "No local description. This fee may be provider-specific.",
      examples: [],
    }
  )
}

