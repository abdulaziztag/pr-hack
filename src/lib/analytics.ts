const K = "fairlend.analytics.v1"

export type CounterKey =
  | "apply_submits"
  | "offers_views"
  | "explain_fee_opens"
  | "p2p_posts"
  | "p2p_funded"
  | "escrow_release"
  | "admin_tariffs_save"

export interface Analytics {
  counts: Record<CounterKey, number>
}

function blank(): Analytics {
  return {
    counts: {
      apply_submits: 0,
      offers_views: 0,
      explain_fee_opens: 0,
      p2p_posts: 0,
      p2p_funded: 0,
      escrow_release: 0,
      admin_tariffs_save: 0,
    },
  }
}

export function readAnalytics(): Analytics {
  if (typeof window === "undefined") return blank()
  try {
    const stored = sessionStorage.getItem(K)
    if (!stored) return blank()
    return JSON.parse(stored) as Analytics
  } catch {
    return blank()
  }
}

export function writeAnalytics(a: Analytics) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(K, JSON.stringify(a))
  }
}

export function incr(key: CounterKey): number {
  const a = readAnalytics()
  a.counts[key] = (a.counts[key] || 0) + 1
  writeAnalytics(a)
  return a.counts[key]
}

export function resetAnalytics() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(K)
  }
}

