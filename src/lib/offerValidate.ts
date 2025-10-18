import { RawOffer } from "./types"

export interface OfferIssue {
  path: string
  message: string
  severity: "error" | "warn"
}

export function validateOffer(o: RawOffer): OfferIssue[] {
  const issues: OfferIssue[] = []

  // Required fields
  if (!o.provider) {
    issues.push({
      path: "provider",
      message: "Provider missing",
      severity: "error",
    })
  }
  if (!o.rail) {
    issues.push({ path: "rail", message: "Rail missing", severity: "error" })
  }

  // Negative values
  if ((o.dailyRatePct ?? 0) < 0 || (o.monthlyRatePct ?? 0) < 0) {
    issues.push({ path: "rate", message: "Negative rate", severity: "error" })
  }
  if ((o.upfrontFeePct ?? 0) < 0) {
    issues.push({
      path: "upfrontFeePct",
      message: "Negative upfront fee",
      severity: "error",
    })
  }
  if ((o.minAmount ?? 0) < 0 || (o.maxAmount ?? 0) < 0) {
    issues.push({
      path: "amounts",
      message: "Invalid limits",
      severity: "error",
    })
  }

  // Range validations
  if (o.minAmount && o.maxAmount && o.minAmount > o.maxAmount) {
    issues.push({
      path: "amounts",
      message: "minAmount > maxAmount",
      severity: "error",
    })
  }
  if (o.minDays && o.maxDays && o.minDays > o.maxDays) {
    issues.push({
      path: "days",
      message: "minDays > maxDays",
      severity: "error",
    })
  }

  // Gentle guidance (warnings)
  if (!o.feeClauses?.length) {
    issues.push({
      path: "feeClauses",
      message: "No fee clauses — add at least one",
      severity: "warn",
    })
  }
  if (!o.monthlyRatePct && !o.dailyRatePct) {
    issues.push({
      path: "rate",
      message: "No interest rate detected — confirm text",
      severity: "warn",
    })
  }

  return issues
}

