import { readWallet } from "./lender";
import { listOffers } from "./lenderOffers";

export function activeUnallocatedSum(): number {
  const arr = listOffers().filter((o) => o.status === "ACTIVE");
  return arr.reduce((s, o) => s + Math.max(0, o.amount - o.allocated), 0);
}

export function walletAvailableForNewOffer(): number {
  const bal = Math.max(0, readWallet()?.balance ?? 0);
  return Math.max(0, bal - activeUnallocatedSum());
}

