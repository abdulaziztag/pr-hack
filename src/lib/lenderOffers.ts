import { readWallet } from "./lender";

export type OfferStatus = "ACTIVE" | "PAUSED" | "CANCELLED" | "FULLY_ALLOCATED";

export interface LenderOffer {
  id: string;
  createdAt: number;
  updatedAt: number;

  // Economics
  amount: number; // total capital allocated to this offer (UZS)
  minTermDays: number; // inclusive
  maxTermDays: number; // inclusive
  targetDailyRatePct: number; // e.g., 0.001 = 0.1%/day (≈ 36.5% APR simple)

  // Risk/caps
  maxPerBorrower: number; // cap per single borrower (UZS)
  allowBuckets: ("A" | "B" | "C" | "D")[]; // acceptable borrower buckets

  // State
  status: OfferStatus;
  allocated: number; // sum allocated by matcher (simulated later)
  notes?: string;
}

const K = "fairlend.lender.offers.v1";
const uid = (p = "ofr") =>
  `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;

function readArr(): LenderOffer[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(K) || "[]");
  } catch {
    return [];
  }
}
function writeArr(v: LenderOffer[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(K, JSON.stringify(v));
}

export function listOffers(): LenderOffer[] {
  return readArr();
}
export function getOffer(id: string): LenderOffer | null {
  return readArr().find((o) => o.id === id) || null;
}

export function createOffer(
  input: Omit<
    LenderOffer,
    "id" | "createdAt" | "updatedAt" | "allocated" | "status"
  > & { status?: OfferStatus }
): LenderOffer {
  const o: LenderOffer = {
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    allocated: 0,
    status: input.status ?? "ACTIVE",
    ...input,
  };
  const arr = readArr();
  arr.unshift(o);
  writeArr(arr);
  return o;
}

export function updateOffer(
  id: string,
  patch: Partial<LenderOffer>
): LenderOffer | null {
  const arr = readArr();
  const i = arr.findIndex((o) => o.id === id);
  if (i === -1) return null;
  arr[i] = { ...arr[i], ...patch, updatedAt: Date.now() };
  writeArr(arr);
  return arr[i];
}

export function setStatus(
  id: string,
  status: OfferStatus
): LenderOffer | null {
  return updateOffer(id, { status });
}

export function cancelOffer(id: string): LenderOffer | null {
  return updateOffer(id, { status: "CANCELLED" });
}

export function availableCapacity(o: LenderOffer): number {
  // capacity bounded by amount - allocated and wallet balance
  const remainingOffer = Math.max(0, o.amount - o.allocated);
  const w = readWallet();
  const walletBal = Math.max(0, w?.balance ?? 0);
  // naive bound: cannot allocate more than wallet balance across all active offers
  // Here we simply report per-offer remaining; wallet gating is enforced in UI validations.
  return Math.min(remainingOffer, walletBal);
}

