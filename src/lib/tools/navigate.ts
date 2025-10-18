import type { NavigateInput, NavigateOutput } from "./types"

export function navigate(_: NavigateInput): NavigateOutput {
  return { ok: true }
}

