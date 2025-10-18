"use client"

import * as React from "react"
import type { BlocksEnvelope } from "@/lib/ai/blocks"

export default function RenderBlocks({ data }: { data: BlocksEnvelope }) {
  return (
    <div className="my-2 space-y-3">
      {data.blocks.map((b, i) => {
        if (b.type === "bullets") {
          return (
            <div key={i} className="rounded-xl border bg-card p-3">
              {b.title && <div className="mb-2 font-medium">{b.title}</div>}
              <ul className="list-disc pl-5 text-sm">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          )
        }
        if (b.type === "table") {
          return (
            <div key={i} className="overflow-hidden rounded-xl border">
              {b.title && (
                <div className="border-b bg-muted px-3 py-2 text-sm font-medium">
                  {b.title}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      {b.columns.map((c, j) => (
                        <th key={j} className="px-3 py-2 text-left">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={ri} className="even:bg-muted/40">
                        {r.map((cell, cj) => (
                          <td key={cj} className="px-3 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
        // note
        return (
          <div
            key={i}
            className="rounded-xl border bg-yellow-50 p-3 text-sm dark:bg-yellow-900/20"
          >
            {"text" in b ? b.text : ""}
          </div>
        )
      })}
    </div>
  )
}

