export const SAFETY = {
  demoMode: true, // hard-coded ON for hackathon
  analyticsEnabled: false, // local console only
  maskPII: true, // mask phone/id in UI + logs
}

export function maskPII(s: string): string {
  if (!s) return s
  // Keep first/last char, mask middle
  return s.length <= 4
    ? "*".repeat(s.length)
    : s[0] + "*".repeat(s.length - 2) + s[s.length - 1]
}

export function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const c = JSON.parse(JSON.stringify(obj))
  if (c.phone) c.phone = maskPII(String(c.phone))
  if (c.idNumber) c.idNumber = maskPII(String(c.idNumber))
  if (c.fullName) c.fullName = maskPII(String(c.fullName))
  return c
}

/**
 * Reset all demo data (intake, offers, escrow, audit, analytics, lender profile/wallet/offers/holds, borrower kyc)
 */
export function resetDemo() {
  if (typeof window === "undefined") return

  const keys = [
    "fairlend.intake",
    "fairlend.p2p.intent",
    "fairlend.p2p.requests",
    "fairlend.p2p.escrows",
    "fairlend.audit.v1",
    "fairlend.analytics.v1",
    "fairlend.tariffs.v1",
    "fairlend.lender.profile",
    "fairlend.lender.wallet",
    "fairlend.lender.offers.v1",
    "fairlend.lender.holds.v1",
    "fairlend.borrower.kyc",
  ]

  keys.forEach((key) => {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {
      console.error(`Failed to remove ${key}:`, e)
    }
  })
}

/**
 * Clear only personal data (borrower KYC and lender profile) while preserving other demo data
 */
export function clearPersonalData() {
  if (typeof window === "undefined") return

  const keys = ["fairlend.borrower.kyc", "fairlend.lender.profile"]

  keys.forEach((key) => {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {
      console.error(`Failed to remove ${key}:`, e)
    }
  })
}
