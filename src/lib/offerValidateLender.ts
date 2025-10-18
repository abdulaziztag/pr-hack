import { LenderOffer } from "./lenderOffers";

export interface OfferIssue {
  path: string;
  message: string;
  severity: "error" | "warn";
}

export function validateLenderOffer(o: LenderOffer): OfferIssue[] {
  const iss: OfferIssue[] = [];
  if (o.amount < 50_000)
    iss.push({
      path: "amount",
      message: "Minimum amount is 50,000 UZS.",
      severity: "error",
    });
  if (o.maxPerBorrower <= 0 || o.maxPerBorrower > o.amount)
    iss.push({
      path: "maxPerBorrower",
      message: "Per-borrower cap must be >0 and ≤ amount.",
      severity: "error",
    });
  if (
    o.minTermDays < 5 ||
    o.maxTermDays > 180 ||
    o.minTermDays > o.maxTermDays
  )
    iss.push({
      path: "term",
      message: "Term must be between 5 and 180 days and min ≤ max.",
      severity: "error",
    });
  if (o.targetDailyRatePct <= 0 || o.targetDailyRatePct > 0.01)
    iss.push({
      path: "rate",
      message:
        "Daily rate must be between 0.0001 and 0.01 (0.01%–1%/day).",
      severity: "error",
    });
  if (!o.allowBuckets?.length)
    iss.push({
      path: "allowBuckets",
      message: "Select at least one borrower bucket (A–D).",
      severity: "warn",
    });
  return iss;
}

