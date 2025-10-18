export type LenderId = string;

export interface LenderProfile {
  id: LenderId;
  fullName: string;
  phoneMasked: string; // store masked value only
  nationality?: string;
  riskAcknowledged: boolean;
  termsAccepted: boolean;
  policy?: {
    terms?: string | null;
    risk?: string | null;
    privacy?: string | null;
  };
  createdAt: number;
  updatedAt: number;
}

export type TxType =
  | "TOP_UP"
  | "WITHDRAW"
  | "INTEREST"
  | "REFUND"
  | "ADJUST"
  | "HOLD"
  | "RELEASE"
  | "LOSS";
export interface WalletTx {
  id: string;
  ts: number;
  type: TxType;
  amount: number; // positive numbers; sign implied by type
  note?: string;
}

export interface Wallet {
  ownerId: LenderId;
  balance: number; // UZS
  txs: WalletTx[];
  updatedAt: number;
}

const K_PROFILE = "fairlend.lender.profile";
const K_WALLET = "fairlend.lender.wallet";

const uid = (p = "id") =>
  `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;

export function readProfile(): LenderProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(K_PROFILE) || "null");
  } catch {
    return null;
  }
}
export function saveProfile(p: LenderProfile) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(K_PROFILE, JSON.stringify(p));
}

export function readWallet(): Wallet | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(K_WALLET) || "null");
  } catch {
    return null;
  }
}
export function saveWallet(w: Wallet) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(K_WALLET, JSON.stringify(w));
}

export function ensureWallet(ownerId: LenderId): Wallet {
  const w = readWallet();
  if (w && w.ownerId === ownerId) return w;
  const nw: Wallet = {
    ownerId,
    balance: 0,
    txs: [],
    updatedAt: Date.now(),
  };
  saveWallet(nw);
  return nw;
}

export function postTx(type: TxType, amount: number, note?: string): Wallet {
  const w = readWallet();
  if (!w) throw new Error("Wallet not initialized");
  const tx: WalletTx = {
    id: uid("tx"),
    ts: Date.now(),
    type,
    amount: Math.max(0, Math.round(amount)),
    note,
  };
  w.txs.unshift(tx);
  // Balance math (TOP_UP/INTEREST/ADJUST/RELEASE increase; WITHDRAW/REFUND/HOLD/LOSS decrease)
  const inc =
    type === "TOP_UP" ||
    type === "INTEREST" ||
    type === "ADJUST" ||
    type === "RELEASE"
      ? 1
      : -1;
  w.balance = Math.max(0, w.balance + inc * tx.amount);
  w.updatedAt = Date.now();
  saveWallet(w);
  return w;
}

export function hold(amount: number, note?: string): Wallet {
  return postTx("HOLD", amount, note || "Escrow hold");
}

export function release(amount: number, note?: string): Wallet {
  return postTx("RELEASE", amount, note || "Escrow release");
}

export function postInterest(amount: number, note?: string): Wallet {
  return postTx("INTEREST", amount, note);
}

export function postLoss(amount: number, note?: string): Wallet {
  return postTx("LOSS", amount, note || "Loss write-down");
}

