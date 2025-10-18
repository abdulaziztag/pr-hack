/**
 * Network guard for demo mode.
 * All external network requests are blocked in the demo.
 */
export async function guardedFetch(): Promise<never> {
  throw new Error("Network is disabled in demo mode.")
}

