import { Escrow, Repayment } from "./types";

const DAY_MS = 86_400_000;

export interface AccrualSnapshot {
  sinceFundingDays: number; // floor((now - fundedAt)/DAY_MS)
  principal: number;
  dailyPct: number; // blended
  accrued: number; // principal * dailyPct * sinceFundingDays (simple)
  totalDueToday: number; // principal + accrued
}

export function snapshot(e: Escrow): AccrualSnapshot {
  const fundedAt = e.fundedAt ?? Date.now();
  const days = Math.max(0, Math.floor((Date.now() - fundedAt) / DAY_MS));
  const principal = Math.max(0, e.outstandingPrincipal ?? 0);
  const daily = Math.max(0, e.pricing?.blendedDailyPct ?? 0);
  const accrued = Math.round(principal * daily * days);
  return {
    sinceFundingDays: days,
    principal,
    dailyPct: daily,
    accrued,
    totalDueToday: principal + accrued,
  };
}

/**
 * Apply an on-time or late repayment. Mutates escrow object properties and returns a Repayment record.
 */
export function applyRepayment(
  e: Escrow,
  payPrincipal: number,
  payInterest: number,
  daysElapsedOverride?: number
): Repayment {
  const s = snapshot(e);
  const days = daysElapsedOverride ?? s.sinceFundingDays;
  const p = Math.min(payPrincipal, e.outstandingPrincipal ?? 0);
  
  // Calculate total accrued based on days (actual or override)
  const principal = Math.max(0, e.outstandingPrincipal ?? 0);
  const daily = Math.max(0, e.pricing?.blendedDailyPct ?? 0);
  const totalAccrued = Math.round(principal * daily * days);
  
  const i = Math.min(payInterest, (e.accruedInterest ?? 0) + totalAccrued);
  e.outstandingPrincipal = Math.max(0, (e.outstandingPrincipal ?? 0) - p);
  e.accruedInterest = Math.max(0, (e.accruedInterest ?? 0) + totalAccrued - i);
  const r: Repayment = {
    id: `rp_${Date.now()}`,
    ts: Date.now(),
    daysElapsed: days,
    principalPaid: p,
    interestPaid: i,
  };
  e.repayments = [r, ...(e.repayments ?? [])];
  if ((e.outstandingPrincipal ?? 0) === 0) e.repayStatus = "REPAID";
  return r;
}

/**
 * Mark default with recovery ratio [0..1]. Returns loss amount on principal.
 */
export function applyDefault(e: Escrow, recoveryRatio: number): number {
  const principal = e.outstandingPrincipal ?? 0;
  const recovered = Math.round(
    principal * Math.max(0, Math.min(1, recoveryRatio))
  );
  const loss = Math.max(0, principal - recovered);
  e.outstandingPrincipal = 0;
  e.accruedInterest = 0;
  e.repayStatus = "DEFAULTED";
  return loss;
}

