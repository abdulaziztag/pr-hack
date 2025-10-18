"use client"

import * as React from "react"
import type { ToolResult } from "@/lib/tools/types"

export default function ActionBar({
  tools,
  onAction,
}: {
  tools: ToolResult[]
  onAction: (action: { type: string; arg?: string }) => void
}) {
  const chips: Array<{ label: string; type: string; arg?: string }> = []

  // Map tool outputs to reasonable next-step chips
  if (tools.some((t) => t.tool === "compareOffers")) {
    chips.push({ label: "Filter: BANK", type: "filter", arg: "BANK" })
    chips.push({ label: "Open P2P", type: "open", arg: "P2P" })
  }
  if (tools.some((t) => t.tool === "eligibilityCheck")) {
    chips.push({ label: "Adjust amount/term", type: "open", arg: "intake" })
  }
  if (tools.some((t) => t.tool === "p2pPreview")) {
    chips.push({ label: "Go to P2P", type: "open", arg: "P2P" })
  }

  if (!chips.length) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={() => onAction({ type: c.type, arg: c.arg })}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`Action: ${c.label}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

