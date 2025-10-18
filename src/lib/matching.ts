import { FundingPlan, FundingLeg } from "./matching.types";
import { listOffers, LenderOffer } from "./lenderOffers";
import { readWallet } from "./lender";

export interface MatchInput {
  amount: number;
  termDays: number;
  borrowerBucket: "A" | "B" | "C" | "D";
}

function eligibleOffer(
  o: LenderOffer,
  termDays: number,
  bucket: string
): boolean {
  if (o.status !== "ACTIVE") return false;
  if (termDays < o.minTermDays || termDays > o.maxTermDays) return false;
  if (o.allowBuckets && !o.allowBuckets.includes(bucket as "A" | "B" | "C" | "D"))
    return false;
  const remaining = Math.max(0, o.amount - o.allocated);
  return remaining > 0;
}

function byPriceAsc(a: LenderOffer, b: LenderOffer) {
  return a.targetDailyRatePct - b.targetDailyRatePct;
}

export function buildGreedyPlan(inp: MatchInput): FundingPlan {
  const offers = listOffers()
    .filter((o) => eligibleOffer(o, inp.termDays, inp.borrowerBucket))
    .sort(byPriceAsc);
  const legs: FundingLeg[] = [];

  // simple wallet awareness: if wallet.balance is 0, result will be shortfall
  const walletBal = Math.max(0, readWallet()?.balance ?? 0);
  let fillable = Math.min(inp.amount, walletBal);

  for (const o of offers) {
    if (fillable <= 0) break;
    const capOffer = Math.max(0, o.amount - o.allocated);
    if (capOffer <= 0) continue;
    const perBorrower = Math.min(o.maxPerBorrower, capOffer);
    const take = Math.min(perBorrower, fillable);
    if (take <= 0) continue;
    legs.push({
      offerId: o.id,
      amount: take,
      dailyRatePct: o.targetDailyRatePct,
      maxPerBorrower: o.maxPerBorrower,
    });
    fillable -= take;
  }

  const filled = legs.reduce((s, l) => s + l.amount, 0);
  const plan: FundingPlan = {
    requested: inp.amount,
    termDays: inp.termDays,
    filled,
    legs,
    shortfall: Math.max(0, inp.amount - filled),
    strategy: "GREEDY",
  };
  return plan;
}

export function buildProRataPlan(inp: MatchInput): FundingPlan {
  const offers = listOffers()
    .filter((o) => eligibleOffer(o, inp.termDays, inp.borrowerBucket))
    .sort(byPriceAsc);
  const walletBal = Math.max(0, readWallet()?.balance ?? 0);
  const totalCapacity = offers.reduce(
    (s, o) =>
      s + Math.min(Math.max(0, o.amount - o.allocated), o.maxPerBorrower),
    0
  );
  const fillTarget = Math.min(inp.amount, walletBal, totalCapacity);
  const legs: FundingLeg[] = [];
  if (fillTarget <= 0)
    return {
      requested: inp.amount,
      termDays: inp.termDays,
      filled: 0,
      legs: [],
      shortfall: inp.amount,
      strategy: "PRORATA",
    };

  offers.forEach((o) => {
    const cap = Math.min(
      Math.max(0, o.amount - o.allocated),
      o.maxPerBorrower
    );
    if (cap <= 0) return;
    const share = Math.floor((cap / totalCapacity) * fillTarget);
    if (share > 0)
      legs.push({
        offerId: o.id,
        amount: share,
        dailyRatePct: o.targetDailyRatePct,
        maxPerBorrower: o.maxPerBorrower,
      });
  });
  // Fill remainder greedily to cheapest
  let assigned = legs.reduce((s, l) => s + l.amount, 0);
  for (const o of offers) {
    if (assigned >= fillTarget) break;
    const leg = legs.find((l) => l.offerId === o.id);
    const current = leg?.amount ?? 0;
    const cap = Math.min(
      Math.max(0, o.amount - o.allocated),
      o.maxPerBorrower
    );
    const extra = Math.min(fillTarget - assigned, cap - current);
    if (extra > 0) {
      if (leg) leg.amount += extra;
      else
        legs.push({
          offerId: o.id,
          amount: extra,
          dailyRatePct: o.targetDailyRatePct,
          maxPerBorrower: o.maxPerBorrower,
        });
      assigned += extra;
    }
  }

  const filled = legs.reduce((s, l) => s + l.amount, 0);
  return {
    requested: inp.amount,
    termDays: inp.termDays,
    filled,
    legs,
    shortfall: Math.max(0, inp.amount - filled),
    strategy: "PRORATA",
  };
}

