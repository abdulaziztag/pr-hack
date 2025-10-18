export type Rail = "BANK" | "P2P"

export interface RawOffer {
  id: string
  provider: string
  rail: Rail

  // Economics (all percentages as decimals, e.g., 0.05 = 5%)
  upfrontFeePct?: number // e.g., "transfer to card" fee at disbursement
  monthlyRatePct?: number // simple monthly interest rate
  dailyRatePct?: number // alternative simple daily rate (use whichever provided)
  usageFeeFlat?: number // flat fee charged once
  disbursementFlat?: number // flat fee at start
  closingFlat?: number // flat fee at end

  // Policy
  minAmount?: number
  maxAmount?: number
  minDays?: number
  maxDays?: number

  // UX
  notes?: string
  feeClauses: FeeClause[]
  eligibility?: EligibilityRule
}

export interface FeeClause {
  label: string // e.g., "5% card transfer fee"
  kind: "upfront" | "interest" | "usage" | "closing"
  citation?: string // optional string to simulate a source
  plainMeaning: string // simple language explanation
}

export interface NormalizedOffer {
  id: string
  provider: string
  rail: Rail
  aprPct: number // annualized % (e.g., 38.2 for 38.2%)
  totalRepay: number // in UZS
  breakdown: {
    principal: number
    interest: number
    upfrontFees: number
    usageFees: number
    closingFees: number
  }
  feeClauses: FeeClause[]
}

export interface IntakeData {
  amount: number
  termDays: number
  score: number
  purpose?: string
  phone?: string
  idNumber?: string
}

export interface Applicant {
  amount: number
  termDays: number
  monthlyIncome: number
  employmentStatus: "employed" | "self" | "student" | "unemployed"
  hasDelinquency: boolean
  agreeToTerms: boolean
  score: number
  bucket: "A" | "B" | "C" | "D"
  purpose?: string
  phone?: string
  idNumber?: string
}

export interface EligibilityRule {
  minScore?: number
  maxAmtToIncome?: number
  minIncome?: number
  allowedEmployment?: ("employed" | "self" | "student" | "unemployed")[]
  disallowDelinquency?: boolean
}

export type EscrowStatus =
  | "PENDING"
  | "FUNDED"
  | "RELEASE_READY"
  | "RELEASED"
  | "CANCELLED"
  | "EXPIRED"

export interface BorrowRequest {
  id: string
  amount: number
  termDays: number
  score: number
  createdAt: number
}

export interface LenderPledge {
  id: string
  lenderName: string
  amount: number
  rateDailyPct: number // simple daily rate
  createdAt: number
}

export type RepayStatus = "ACTIVE" | "REPAID" | "DEFAULTED"

export interface Repayment {
  id: string
  ts: number
  daysElapsed: number // days since funding (for that action)
  principalPaid: number // UZS
  interestPaid: number // UZS
  note?: string
}

export interface Escrow {
  id: string
  requestId: string
  status: EscrowStatus
  targetAmount: number
  fundedAmount: number
  pledges: LenderPledge[]
  legs?: import("./matching.types").FundingLeg[] // Real funding legs from lender offers
  pricing?: {
    blendedDailyPct: number // Blended daily rate across all legs
  }
  // Release conditions the user can toggle in the demo
  conditions: {
    borrowerConfirmedReceipt: boolean
    coolingOffComplete: boolean
    noDispute: boolean
  }
  createdAt: number
  updatedAt: number
  // Repayment lifecycle
  fundedAt?: number // when holds were placed/plan committed
  termDays?: number
  repayStatus?: RepayStatus // default "ACTIVE"
  outstandingPrincipal?: number // starts at plan.filled
  accruedInterest?: number // running total
  repayments?: Repayment[]
}

export interface P2PIntent {
  amount: number
  termDays: number
  score: number
  offerId: string
}
