import { tokenize } from "./tokenize"
import type { RagDoc } from "./corpus"

export interface RagIndex {
  docs: RagDoc[]
  df: Map<string, number>
  tf: Map<string, Map<string, number>> // docId -> (term -> tf)
  avgLen: number
}

export function buildIndex(docs: RagDoc[]): RagIndex {
  const tf = new Map<string, Map<string, number>>()
  const df = new Map<string, number>()
  let totalLen = 0

  for (const d of docs) {
    const terms = tokenize(d.text)
    totalLen += terms.length
    const tmap = new Map<string, number>()
    for (const t of terms) {
      tmap.set(t, (tmap.get(t) || 0) + 1)
    }
    tf.set(d.id, tmap)
    for (const t of new Set(terms)) {
      df.set(t, (df.get(t) || 0) + 1)
    }
  }

  const avgLen = docs.length ? totalLen / docs.length : 0
  return { docs, df, tf, avgLen }
}

export interface RagHit {
  doc: RagDoc
  score: number
  snippet: string
}

export function search(index: RagIndex, query: string, k = 3): RagHit[] {
  const qterms = tokenize(query)
  const N = index.docs.length || 1
  const k1 = 1.5
  const b = 0.75

  const scores = new Map<string, number>()
  for (const d of index.docs) {
    const len = tokenize(d.text).length || 1
    let s = 0
    for (const t of qterms) {
      const n_qi = index.df.get(t) || 0
      if (n_qi === 0) continue
      const idf = Math.log((N - n_qi + 0.5) / (n_qi + 0.5) + 1)
      const f = index.tf.get(d.id)?.get(t) || 0
      const tfw =
        (f * (k1 + 1)) /
        (f + k1 * (1 - b + b * (len / Math.max(1, index.avgLen))))
      s += idf * tfw
    }
    if (s > 0) scores.set(d.id, s)
  }

  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
  return ranked.map(([id, score]) => {
    const doc = index.docs.find((x) => x.id === id)!
    const snippet = buildSnippet(doc.text, qterms)
    return { doc, score, snippet }
  })
}

function buildSnippet(text: string, qterms: string[]): string {
  const words = tokenize(text)
  const window = 40
  let bestStart = 0
  let bestHits = -1
  for (let i = 0; i < words.length; i++) {
    const win = words.slice(i, i + window)
    const hits = qterms.reduce((acc, t) => (win.includes(t) ? acc + 1 : acc), 0)
    if (hits > bestHits) {
      bestHits = hits
      bestStart = i
    }
  }
  const slice = words.slice(bestStart, bestStart + window).join(" ")
  return slice
}

