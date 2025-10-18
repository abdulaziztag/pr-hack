"use client"

import * as React from "react"
import { CORPUS } from "@/lib/rag/index"

/** Replace [^docId] with superscript refs and a title tooltip. */
export default function InlineCitations({ text }: { text: string }) {
  const parts: Array<string | { id: string }> = []
  const re = /\[\^([a-z0-9_-]+)\]/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index)
    if (before) parts.push(before)
    parts.push({ id: m[1] })
    last = m.index + m[0].length
  }
  const after = text.slice(last)
  if (after) parts.push(after)

  return (
    <span>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <React.Fragment key={i}>{p}</React.Fragment>
        ) : (
          <SupRef key={i} id={p.id} />
        )
      )}
    </span>
  )
}

function SupRef({ id }: { id: string }) {
  const doc = CORPUS.find((d) => d.id === id)
  const label = doc ? `${doc.title} — ${doc.source}` : id
  const href = doc?.url
  const shortId = id.split("_")[0]
  const sup = (
    <sup className="ml-0.5 align-super text-xs text-primary">
      [{shortId}]
    </sup>
  )
  
  if (href) {
    return (
      <a
        href={href}
        title={label}
        className="underline decoration-dotted hover:text-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {sup}
      </a>
    )
  }
  return <span title={label}>{sup}</span>
}

