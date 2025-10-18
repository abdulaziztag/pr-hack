import type { P2PPreviewInput, P2PPreviewOutput } from "./types"

export function p2pPreview({
  amount: _amount,
  termDays,
}: P2PPreviewInput): P2PPreviewOutput {
  // Toy curve: shorter terms = higher yield (incentive for lenders)
  const expectedYieldPct = Math.min(36 + (60 - Math.min(60, termDays)) * 0.2, 48)
  const escrowSteps = [
    "Fund escrow",
    "Verify borrower",
    "Disburse on acceptance",
    "Repay into escrow",
    "Release to lender",
  ]
  return {
    expectedYieldPct: Math.round(expectedYieldPct * 100) / 100,
    escrowSteps,
    simulatedMatchId: `SIM-${Math.floor(Math.random() * 1e6)}`,
  }
}

