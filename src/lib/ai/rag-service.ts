import { search, IDX } from "@/lib/rag/index"

export interface RagSnippet {
  id: string
  title: string
  source: string
  url?: string
  snippet: string
  score: number
}

/** Retrieve top-k snippets for a query; safe for client usage (no PII). */
export function retrieveSnippets(query: string, k = 3): RagSnippet[] {
  if (!query || query.trim().length < 2) return []
  const hits = search(IDX, query, k)
  return hits.map((h) => ({
    id: h.doc.id,
    title: h.doc.title,
    source: h.doc.source,
    url: h.doc.url,
    snippet: h.snippet,
    score: Math.round(h.score * 1000) / 1000,
  }))
}

