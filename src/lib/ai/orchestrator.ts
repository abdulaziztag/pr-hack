import type { IntentResult } from "./intent-types"
import { buildResponsePlan, styleGuide } from "./response-templates"
import { buildOffersSnapshot } from "./offers-context"
import { runToolsForIntent } from "./tools-runner"
import { retrieveSnippets } from "./rag-service"

export interface ControlEnvelope {
  plan: ReturnType<typeof buildResponsePlan>
  snapshot: ReturnType<typeof buildOffersSnapshot>
  tools: ReturnType<typeof runToolsForIntent>
  rag: ReturnType<typeof retrieveSnippets>
  style: string
}

/** Build all control artifacts inserted into system message. */
export function buildControl(
  ir: IntentResult,
  lastUserQuery: string
): ControlEnvelope {
  const lang = ir.slots.language ?? "en"
  const plan = buildResponsePlan(ir.intent, lang)
  const snapshot = buildOffersSnapshot()
  const tools = runToolsForIntent(ir)
  const groundedIntents = new Set([
    "explain_apr",
    "fee_explain",
    "bank_vs_p2p",
    "how_p2p_works",
    "policy_privacy",
    "glossary",
  ])
  const rag = groundedIntents.has(ir.intent)
    ? retrieveSnippets(lastUserQuery, 3)
    : []
  const style = styleGuide(plan)
  return { plan, snapshot, tools, rag, style }
}

/** Soft truncate streamed assistant text at plan.maxChars AFTER it stabilizes. */
export function truncateAnswer(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  // Try to cut at line boundary
  const cut = text.slice(0, maxChars)
  const i = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". "))
  return (i > 0 ? cut.slice(0, i + 1) : cut) + " …"
}

