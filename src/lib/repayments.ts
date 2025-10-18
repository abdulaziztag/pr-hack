import { Escrow } from "./types";
import { snapshot, applyRepayment, applyDefault } from "./accrual";
import { releaseHoldsForEscrow } from "./reservations";
import { listOffers, updateOffer } from "./lenderOffers";
import { postInterest, release, postLoss } from "./lender";
import { writeAudit, AuditEvent } from "./audit";

function updateOfferAllocations(e: Escrow) {
  // Reduce allocated when principal is repaid or defaulted
  const legs = e.legs ?? [];
  legs.forEach((l) => {
    const off = listOffers().find((o) => o.id === l.offerId);
    if (!off) return;
    // naive: when loan ends (REPAID/DEFAULTED), free allocation
    if (e.repayStatus === "REPAID" || e.repayStatus === "DEFAULTED") {
      updateOffer(off.id, {
        allocated: Math.max(0, (off.allocated ?? 0) - l.amount),
      });
    }
  });
}

/**
 * On-time repay: pay all accrued interest + principal, release holds, credit interest, free allocation.
 */
export function settleOnTime(e: Escrow) {
  const s = snapshot(e);
  // Credit interest to wallet(s)
  const interestTotal = s.accrued;
  if (interestTotal > 0) postInterest(interestTotal, `Interest repay ${e.id}`);
  // Repay full principal
  applyRepayment(e, s.principal, interestTotal, s.sinceFundingDays);
  // Release holds back to wallet balance
  const rel = releaseHoldsForEscrow(e.id);
  // Free allocated amounts
  updateOfferAllocations(e);
  const auditEvent: AuditEvent = {
    id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    t: Date.now(),
    type: "REPAY_ON_TIME",
    payload: { escrowId: e.id, released: rel, interest: interestTotal },
  };
  writeAudit([auditEvent]);
}

/**
 * Late repay: add extra late days and then repay all.
 */
export function settleLate(e: Escrow, extraDays: number) {
  const s0 = snapshot(e);
  const extra = Math.max(0, extraDays);
  const lateInterest = Math.round(
    (e.outstandingPrincipal ?? 0) *
      (e.pricing?.blendedDailyPct ?? 0) *
      extra
  );
  const interestTotal = s0.accrued + lateInterest;
  if (interestTotal > 0)
    postInterest(interestTotal, `Interest late repay ${e.id} (+${extra}d)`);
  applyRepayment(e, s0.principal, interestTotal, s0.sinceFundingDays + extra);
  const rel = releaseHoldsForEscrow(e.id);
  updateOfferAllocations(e);
  const auditEvent: AuditEvent = {
    id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    t: Date.now(),
    type: "REPAY_LATE",
    payload: {
      escrowId: e.id,
      extraDays: extra,
      interest: interestTotal,
      released: rel,
    },
  };
  writeAudit([auditEvent]);
}

/**
 * Default with partial recovery (e.g., 40% recovered). Releases recovered portion only; records loss.
 */
export function markDefault(e: Escrow, recoveryRatio: number) {
  const loss = applyDefault(e, recoveryRatio);
  // Release recovered principal (if any)
  const toRelease = Math.round(
    (e.legs?.reduce((s, l) => s + l.amount, 0) ?? 0) *
      Math.max(0, Math.min(1, recoveryRatio))
  );
  if (toRelease > 0)
    release(
      toRelease,
      `Recovery ${Math.round(recoveryRatio * 100)}% ${e.id}`
    );
  if (loss > 0) postLoss(loss, `Default loss ${e.id}`);
  updateOfferAllocations(e);
  const auditEvent: AuditEvent = {
    id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    t: Date.now(),
    type: "DEFAULT",
    payload: {
      escrowId: e.id,
      recovery: recoveryRatio,
      loss,
      released: toRelease,
    },
  };
  writeAudit([auditEvent]);
}

