let failCount = 0
let openUntil = 0

export function circuitOk(): boolean {
  return Date.now() > openUntil
}

export function circuitOnFail() {
  failCount += 1
  if (failCount >= 3) {
    openUntil = Date.now() + 15_000 // 15s open
    failCount = 0
  }
}

export function circuitOnSuccess() {
  failCount = 0
  openUntil = 0
}

export async function withBackoff<T>(
  fn: () => Promise<T>,
  max = 2
): Promise<T> {
  let delay = 300
  let lastErr: any
  for (let i = 0; i <= max; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, delay))
      delay *= 2
    }
  }
  throw lastErr
}

