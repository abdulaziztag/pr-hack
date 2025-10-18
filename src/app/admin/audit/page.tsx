"use client"

import * as React from "react"

export default function AuditPage() {
  const [rows, setRows] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch("/admin/audit")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]))
  }, [])

  return (
    <main className="p-4">
      <h1 className="mb-3 text-lg font-semibold">Audit Logs (Demo)</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        In-memory ring buffer of recent chat requests (max 300 entries). No PII
        stored.
      </p>
      <div className="overflow-auto rounded border">
        <table className="min-w-[720px] text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-2 py-1 text-left">Time</th>
              <th className="px-2 py-1 text-left">Session</th>
              <th className="px-2 py-1 text-left">Intent</th>
              <th className="px-2 py-1 text-left">Redacted</th>
              <th className="px-2 py-1 text-left">Flags</th>
              <th className="px-2 py-1 text-left">Prompt</th>
              <th className="px-2 py-1 text-left">Answer</th>
              <th className="px-2 py-1 text-left">Duration (ms)</th>
              <th className="px-2 py-1 text-left">OK</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-2 py-4 text-center text-muted-foreground">
                  No audit entries yet
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="even:bg-muted/40">
                  <td className="px-2 py-1">
                    {new Date(r.ts).toLocaleTimeString()}
                  </td>
                  <td className="px-2 py-1 font-mono text-xs">
                    {r.session.slice(0, 12)}...
                  </td>
                  <td className="px-2 py-1">{r.intent}</td>
                  <td className="px-2 py-1">{String(r.redacted)}</td>
                  <td className="px-2 py-1 text-xs">
                    {(r.flags || []).join(", ") || "—"}
                  </td>
                  <td className="px-2 py-1">{r.promptChars} chars</td>
                  <td className="px-2 py-1">{r.answerChars ?? "—"}</td>
                  <td className="px-2 py-1">{r.durationMs ?? "—"}</td>
                  <td className="px-2 py-1">
                    {r.ok ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
