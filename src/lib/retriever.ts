import bankAData from "@/data/terms/bank-a.json"
import bankBData from "@/data/terms/bank-b.json"
import p2pData from "@/data/terms/p2p.json"

export interface CorpusEntry {
  id: string
  provider: string
  rail: "BANK" | "P2P"
  section: string
  title: string
  clause: string
  citation: string
  sourceHint?: string
  tags?: string[]
}

export interface Retrieved {
  entry: CorpusEntry
  score: number
}

export interface RetrieveQuery {
  provider?: string // e.g., "Bank A Micro"
  rail?: "BANK" | "P2P"
  feeLabels?: string[] // from feeClauses labels
  keywords?: string[] // extra cues (e.g., "upfront", "5%")
}

let cachedCorpus: CorpusEntry[] | null = null

/**
 * Load and cache all JSON corpus files from /src/data/terms at runtime.
 */
export async function loadCorpus(): Promise<CorpusEntry[]> {
  if (cachedCorpus) return cachedCorpus

  // Static imports are already loaded
  cachedCorpus = [
    ...(bankAData as CorpusEntry[]),
    ...(bankBData as CorpusEntry[]),
    ...(p2pData as CorpusEntry[]),
  ]

  return cachedCorpus
}

/**
 * Tokenize a string into lowercase tokens, filtering out short tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2)
}

/**
 * Build term frequency map for a document
 */
function buildTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1)
  }
  return tf
}

/**
 * Calculate document frequency (how many docs contain each term)
 */
function buildDF(corpus: CorpusEntry[]): Map<string, number> {
  const df = new Map<string, number>()
  for (const entry of corpus) {
    const allText = [
      entry.title,
      entry.clause,
      entry.sourceHint || "",
      ...(entry.tags || []),
    ].join(" ")
    const tokens = new Set(tokenize(allText))
    // Convert Set to Array for iteration
    Array.from(tokens).forEach((token) => {
      df.set(token, (df.get(token) || 0) + 1)
    })
  }
  return df
}

/**
 * In-browser, dependency-free lexical retriever:
 * - Builds a tiny term-frequency index (by splitting on non-letters/digits).
 * - Scores with tf * idf-lite (idf ≈ 1 / docFreq) and a small provider/rail bonus.
 * - Returns top K entries with score.
 */
export async function retrieveClauses(
  q: RetrieveQuery,
  k = 5
): Promise<Retrieved[]> {
  const corpus = await loadCorpus()

  // Build query tokens
  const queryTokens = new Set<string>()

  if (q.provider) {
    tokenize(q.provider).forEach((t) => queryTokens.add(t))
  }

  if (q.rail) {
    tokenize(q.rail).forEach((t) => queryTokens.add(t))
  }

  if (q.feeLabels) {
    q.feeLabels.forEach((label) => {
      tokenize(label).forEach((t) => queryTokens.add(t))
    })
  }

  if (q.keywords) {
    q.keywords.forEach((kw) => {
      tokenize(kw).forEach((t) => queryTokens.add(t))
    })
  }

  if (queryTokens.size === 0) {
    // No query tokens, return empty or random sample
    return corpus.slice(0, k).map((entry) => ({ entry, score: 0 }))
  }

  // Build document frequency
  const df = buildDF(corpus)
  const numDocs = corpus.length

  // Score each document
  const scored: Retrieved[] = []

  for (const entry of corpus) {
    const allText = [
      entry.title,
      entry.clause,
      entry.sourceHint || "",
      ...(entry.tags || []),
    ].join(" ")
    const docTokens = tokenize(allText)
    const tf = buildTF(docTokens)

    let score = 0

    // TF-IDF scoring for query tokens - convert Set to Array
    Array.from(queryTokens).forEach((queryToken) => {
      const termFreq = tf.get(queryToken) || 0
      if (termFreq > 0) {
        const docFreq = df.get(queryToken) || 1
        const idf = numDocs / docFreq // Simple IDF
        score += termFreq * idf
      }
    })

    // Provider bonus: +10% if exact match
    if (q.provider && entry.provider === q.provider) {
      score *= 1.1
    }

    // Rail bonus: +5% if match
    if (q.rail && entry.rail === q.rail) {
      score *= 1.05
    }

    if (score > 0) {
      scored.push({ entry, score })
    }
  }

  // Sort by score descending and return top K
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, k)
}

