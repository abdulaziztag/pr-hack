type Bucket = { tokens: number; last: number }

const store = new Map<string, Bucket>()
export interface RateResult {
  ok: boolean
  retryAfterMs?: number
}

export function rateCheck(
  key: string,
  capacity = 6,
  refillPerSec = 0.5
): RateResult {
  const now = Date.now()
  const b = store.get(key) ?? { tokens: capacity, last: now }
  const elapsed = (now - b.last) / 1000
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec)
  b.last = now

  if (b.tokens < 1) {
    const needed = 1 - b.tokens
    const retry = (needed / refillPerSec) * 1000
    store.set(key, b)
    return { ok: false, retryAfterMs: Math.ceil(retry) }
  }
  b.tokens -= 1
  store.set(key, b)
  return { ok: true }
}

