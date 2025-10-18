export type Block =
  | { type: "table"; title?: string; columns: string[]; rows: Array<string[]> }
  | { type: "bullets"; title?: string; items: string[] }
  | { type: "note"; text: string }

export interface BlocksEnvelope {
  version: "fl-1"
  blocks: Block[]
}

/** Parse fenced code block ```fljson ... ``` into BlocksEnvelope (safe). */
export function tryParseBlocks(markdown: string): BlocksEnvelope | null {
  const m = markdown.match(/```fljson\s*([\s\S]*?)```/)
  if (!m) return null
  try {
    const obj = JSON.parse(m[1])
    if (obj && obj.version === "fl-1" && Array.isArray(obj.blocks))
      return obj as BlocksEnvelope
  } catch {
    // Ignore parse errors
  }
  return null
}

