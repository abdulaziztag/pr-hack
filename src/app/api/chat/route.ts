import type { NextRequest } from "next/server"
import type { ChatPayload } from "@/lib/ai/types"
import { rateCheck } from "@/lib/safety/rate"
import {
  circuitOk,
  circuitOnFail,
  circuitOnSuccess,
  withBackoff,
} from "@/lib/safety/circuit"
import { redactPII } from "@/lib/safety/redact"
import { safetyGate } from "@/lib/safety/filter"
import { pushAudit } from "@/lib/logs/audit"

export const runtime = "nodejs" // ensure edge isn't used (need fetch stream control)

function sessionKey(req: NextRequest): string {
  const sessionHeader = req.headers.get("x-fl-session") || ""
  const ua = req.headers.get("user-agent") || ""
  return "s:" + (sessionHeader || ua || "anon")
}

async function upstreamSSEProxy(body: ChatPayload): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("Server misconfigured: missing OPENAI_API_KEY")
  }

  // Truncate overly long content (defense-in-depth)
  const messages = body.messages
    .map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, 8000),
    }))
    .slice(-24) // keep last 24 turns

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.OPENAI_TIMEOUT_MS || 60000)
  )

  let upstream: Response
  try {
    // Use Chat Completions API
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: messages,
        stream: true,
        temperature: body.temperature ?? 0.3,
      }),
      signal: controller.signal,
    })
  } catch (e: unknown) {
    clearTimeout(timeout)
    const err = e as Error
    throw new Error(err?.message || "Upstream fetch error")
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout)
    const text = await upstream.text().catch(() => "")
    throw new Error(`OpenAI ${upstream.status}: ${text}`)
  }

  const encoder = new TextEncoder()
  const reader = upstream.body.getReader()

  const stream = new ReadableStream({
    async pull(ctrl) {
      try {
        const { value, done } = await reader.read()
        if (done) {
          ctrl.enqueue(encoder.encode("data: [DONE]\n\n"))
          ctrl.close()
          clearTimeout(timeout)
          return
        }
        // Proxy raw chunk as SSE data frame
        ctrl.enqueue(
          encoder.encode(`data: ${new TextDecoder().decode(value)}\n\n`)
        )
      } catch (error) {
        clearTimeout(timeout)
        ctrl.error(error)
      }
    },
    cancel() {
      clearTimeout(timeout)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

export async function POST(req: NextRequest) {
  const started = Date.now()
  const session = sessionKey(req)

  // Parse body
  let body: ChatPayload
  try {
    body = await req.json()
    if (!Array.isArray(body.messages) || !body.messages.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
      })
    }
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
    })
  }

  // Circuit breaker check
  if (!circuitOk()) {
    pushAudit({
      ts: started,
      session,
      intent: "n/a",
      redacted: false,
      flags: ["circuit_open"],
      promptChars: 0,
      ok: false,
    })
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable. Please retry shortly.",
      }),
      { status: 503 }
    )
  }

  // Rate limiting
  const rate = rateCheck(session, 6, 0.5)
  if (!rate.ok) {
    pushAudit({
      ts: started,
      session,
      intent: "n/a",
      redacted: false,
      flags: ["rate_limited"],
      promptChars: 0,
      ok: false,
    })
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again later." }),
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rate.retryAfterMs ?? 1000) / 1000)),
        },
      }
    )
  }

  // Redact PII from last user message
  const last = body.messages[body.messages.length - 1]
  let redacted = false
  if (last?.role === "user") {
    const r = redactPII(String(last.content || ""))
    if (r.changed) {
      last.content = r.text
      redacted = true
    }
  }

  // Extract intent (coarse, from system message if present)
  const coarseIntent =
    /INTENT=([a-z_]+)/.exec(
      body.messages.find((m) => m.role === "system")?.content || ""
    )?.[1] || "unknown"

  // Safety gate
  const gate = safetyGate(String(last?.content || ""), coarseIntent)
  if (gate.blocked) {
    pushAudit({
      ts: started,
      session,
      intent: coarseIntent,
      redacted,
      flags: gate.flags,
      promptChars: String(last?.content || "").length,
      ok: false,
    })
    return new Response(
      JSON.stringify({ error: "Sorry, I can't help with that request." }),
      { status: 400 }
    )
  }

  // Call upstream with backoff
  try {
    const sse = await withBackoff(async () => upstreamSSEProxy(body), 2)

    circuitOnSuccess()
    const duration = Date.now() - started
    pushAudit({
      ts: started,
      session,
      intent: coarseIntent,
      redacted,
      flags: redacted ? ["pii_redacted"] : [],
      promptChars: JSON.stringify(body).length,
      durationMs: duration,
      ok: true,
    })
    return sse
  } catch (e) {
    circuitOnFail()
    const duration = Date.now() - started
    pushAudit({
      ts: started,
      session,
      intent: coarseIntent,
      redacted,
      flags: redacted ? ["pii_redacted"] : [],
      promptChars: JSON.stringify(body).length,
      durationMs: duration,
      ok: false,
    })
    return new Response(
      JSON.stringify({ error: "Upstream error. Please retry." }),
      { status: 502 }
    )
  }
}
