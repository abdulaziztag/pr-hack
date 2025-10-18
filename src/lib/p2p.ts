export interface Intent {
  amount: number
  termDays: number
  score: number
  offerId?: string
}

const K_INTENT = "fairlend.p2p.intent"
const K_ESCROWS = "fairlend.p2p.escrows"

export function readIntent(): Intent | null {
  if (typeof window === "undefined") return null
  try {
    const stored = sessionStorage.getItem(K_INTENT)
    return stored ? (JSON.parse(stored) as Intent) : null
  } catch {
    return null
  }
}

export function hasEscrows(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = sessionStorage.getItem(K_ESCROWS)
    const arr = stored ? JSON.parse(stored) : []
    return Array.isArray(arr) && arr.length > 0
  } catch {
    return false
  }
}

