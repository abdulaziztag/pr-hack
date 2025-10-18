import { BorrowRequest, Escrow, LenderPledge } from "./types"

const K_REQ = "fairlend.p2p.requests"
const K_ESC = "fairlend.p2p.escrows"

// helpers
const now = () => Date.now()
const uid = (p = "id") =>
  `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = sessionStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(k: string, v: T) {
  if (typeof window !== "undefined")
    sessionStorage.setItem(k, JSON.stringify(v))
}

export function listRequests(): BorrowRequest[] {
  return read<BorrowRequest[]>(K_REQ, [])
}

export function listEscrows(): Escrow[] {
  return read<Escrow[]>(K_ESC, [])
}

export function getEscrow(id: string): Escrow | null {
  return listEscrows().find((e) => e.id === id) || null
}

export function createBorrowRequest(
  amount: number,
  termDays: number,
  score: number
): BorrowRequest {
  const req: BorrowRequest = {
    id: uid("req"),
    amount,
    termDays,
    score,
    createdAt: now(),
  }
  const all = listRequests()
  all.push(req)
  write(K_REQ, all)
  return req
}

export function createEscrowForRequest(req: BorrowRequest): Escrow {
  const esc: Escrow = {
    id: uid("esc"),
    requestId: req.id,
    status: "PENDING",
    targetAmount: req.amount,
    fundedAmount: 0,
    pledges: [],
    conditions: {
      borrowerConfirmedReceipt: false,
      coolingOffComplete: false,
      noDispute: false,
    },
    createdAt: now(),
    updatedAt: now(),
  }
  const all = listEscrows()
  all.push(esc)
  write(K_ESC, all)
  return esc
}

export function addPledge(
  escrowId: string,
  pledge: Omit<LenderPledge, "id" | "createdAt">
): Escrow | null {
  const all = listEscrows()
  const idx = all.findIndex((e) => e.id === escrowId)
  if (idx === -1) return null
  const p: LenderPledge = { id: uid("plg"), createdAt: now(), ...pledge }
  all[idx].pledges.push(p)
  all[idx].fundedAmount = Math.min(
    all[idx].targetAmount,
    all[idx].fundedAmount + p.amount
  )
  if (all[idx].fundedAmount >= all[idx].targetAmount) all[idx].status = "FUNDED"
  all[idx].updatedAt = now()
  write(K_ESC, all)
  return all[idx]
}

export function setConditions(
  escrowId: string,
  conditions: Partial<Escrow["conditions"]>
): Escrow | null {
  const all = listEscrows()
  const idx = all.findIndex((e) => e.id === escrowId)
  if (idx === -1) return null
  all[idx].conditions = { ...all[idx].conditions, ...conditions }
  // auto-advance to RELEASE_READY when all true
  const c = all[idx].conditions
  if (
    c.borrowerConfirmedReceipt &&
    c.coolingOffComplete &&
    c.noDispute &&
    all[idx].status === "FUNDED"
  ) {
    all[idx].status = "RELEASE_READY"
  }
  all[idx].updatedAt = now()
  write(K_ESC, all)
  return all[idx]
}

export function releaseFunds(escrowId: string): Escrow | null {
  const all = listEscrows()
  const idx = all.findIndex((e) => e.id === escrowId)
  if (idx === -1) return null
  if (all[idx].status === "RELEASE_READY") {
    all[idx].status = "RELEASED"
    all[idx].updatedAt = now()
    write(K_ESC, all)
  }
  return all[idx]
}

export function getEscrowById(escrowId: string): Escrow | null {
  const all = listEscrows()
  return all.find((e) => e.id === escrowId) || null
}
