export interface FundingLeg {
  offerId: string;
  lenderName?: string; // optional; can be "Lender Offer …"
  amount: number; // UZS
  dailyRatePct: number; // from offer.targetDailyRatePct
  maxPerBorrower: number;
}

export interface FundingPlan {
  requested: number;
  termDays: number;
  filled: number;
  legs: FundingLeg[];
  shortfall: number; // requested - filled
  strategy: "GREEDY" | "PRORATA";
}

