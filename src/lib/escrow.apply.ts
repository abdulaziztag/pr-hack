import { FundingPlan } from "./matching.types";
import { placeHold } from "./reservations";
import { updateOffer, getOffer } from "./lenderOffers";
import { listEscrows, getEscrow } from "./escrow";

export function commitFundingPlan(escrowId: string, plan: FundingPlan) {
  // Place holds and bump allocated for each leg
  plan.legs.forEach((l) => {
    placeHold(escrowId, l.offerId, l.amount);
    const off = getOffer(l.offerId);
    if (off)
      updateOffer(l.offerId, {
        allocated: Math.min(off.amount, (off.allocated ?? 0) + l.amount),
      });
  });

  // Update escrow with legs and pricing
  const escrow = getEscrow(escrowId);
  if (escrow) {
    const blendedDailyPct =
      plan.legs.length > 0
        ? plan.legs.reduce(
            (s, l) => s + l.dailyRatePct * l.amount,
            0
          ) / plan.filled
        : 0;

    // Update escrow in storage
    const allEscrows = listEscrows();
    const index = allEscrows.findIndex((e) => e.id === escrowId);
    if (index >= 0) {
      allEscrows[index] = {
        ...escrow,
        legs: plan.legs,
        pricing: { blendedDailyPct },
        fundedAmount: plan.filled,
        fundedAt: Date.now(), // Set funded timestamp
        termDays: plan.termDays, // Set term
        outstandingPrincipal: plan.filled, // Initialize principal
        accruedInterest: 0, // Initialize interest
        repayStatus: "ACTIVE", // Set initial status
        updatedAt: Date.now(),
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "fairlend.p2p.escrows",
          JSON.stringify(allEscrows)
        );
      }
    }
  }
}

