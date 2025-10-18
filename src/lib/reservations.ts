import { readWallet, hold, release } from "./lender";

export interface Hold {
  id: string;
  escrowId: string;
  offerId: string;
  amount: number;
  ts: number;
}
const K = "fairlend.lender.holds.v1";
const uid = (p = "h") =>
  `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;

function readAll(): Hold[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(K) || "[]");
  } catch {
    return [];
  }
}
function writeAll(v: Hold[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(K, JSON.stringify(v));
}

export function placeHold(
  escrowId: string,
  offerId: string,
  amount: number
): Hold {
  if (!readWallet()) throw new Error("Wallet missing");
  hold(amount, `Hold for ${escrowId} via ${offerId}`);
  const h: Hold = {
    id: uid(),
    escrowId,
    offerId,
    amount,
    ts: Date.now(),
  };
  const arr = readAll();
  arr.push(h);
  writeAll(arr);
  return h;
}

export function releaseHoldsForEscrow(escrowId: string) {
  const arr = readAll();
  const keep: Hold[] = [];
  let total = 0;
  arr.forEach((h) => {
    if (h.escrowId === escrowId) total += h.amount;
    else keep.push(h);
  });
  if (total > 0) release(total, `Release ${escrowId}`);
  writeAll(keep);
  return total;
}

export function holdsForEscrow(escrowId: string): Hold[] {
  return readAll().filter((h) => h.escrowId === escrowId);
}

export function holdsForOffer(offerId: string): Hold[] {
  return readAll().filter((h) => h.offerId === offerId);
}

