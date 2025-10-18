import type { IntentResult, Slots, Intent } from "./intent-types"

const NUM = /(?:\d[\d\s.,]*)/g

function parseNumberLike(s: string): number | null {
  const clean = s.replace(/\s/g, "").replace(/,/g, "")
  const n = Number(clean)
  return Number.isFinite(n) ? n : null
}

function detectLanguage(q: string): Slots["language"] {
  const lower = q.toLowerCase()
  // naive trigram/keyword heuristic
  if (
    /[ғқўҳ]/i.test(q) ||
    /(salom|qarz|foiz|oylik|uzs|so'm|sum|nima|taqqos)/i.test(lower)
  )
    return "uz"
  // Russian characters: Cyrillic range
  if (
    /[а-яА-ЯёЁ]/i.test(q) ||
    /(привет|займ|ставк|комисс|срок|сума|что|такое|как|работает|спасибо|сравни)/i.test(
      lower
    )
  )
    return "ru"
  return "en"
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function extractAmount(q: string): number | null {
  const m = q.match(NUM)
  if (!m) return null
  // choose the first plausible amount (>= 10k)
  for (const raw of m) {
    const n = parseNumberLike(raw)
    if (n != null && n >= 10_000) return clamp(n, 1_000, 100_000_000)
  }
  return null
}

function extractTermDays(q: string): number | null {
  const lower = q.toLowerCase()
  const days = /(\d{1,3})\s*(day|days|kun|дн)/i.exec(lower)
  const months = /(\d{1,2})\s*(month|months|oy|мес)/i.exec(lower)
  if (days) return clamp(Number(days[1]), 7, 365)
  if (months) return clamp(Number(months[1]) * 30, 7, 365)
  // common quick numbers: 15/30/45/60
  const quick = /(15|30|45|60)/.exec(lower)
  return quick ? clamp(Number(quick[1]), 7, 365) : null
}

function extractRail(q: string): Slots["rail"] {
  const l = q.toLowerCase()
  if (/(p2p|peer|escrow)/i.test(l)) return "P2P"
  if (/(bank|card|deposit)/i.test(l)) return "BANK"
  return null
}

function extractFee(q: string): string | null {
  const l = q.toLowerCase()
  // Order matters: more specific first
  const fees = [
    "late penalty",
    "late",
    "cash-out",
    "transfer",
    "issuance",
    "service",
    "escrow",
    "penalty",
    "комисс",
    "перевод",
    "снятие",
  ]
  const hit = fees.find((f) => l.includes(f))
  // Normalize "late penalty" to "late"
  return hit === "late penalty" ? "late" : hit || null
}

function extractOfferIds(q: string): string[] {
  // Accept patterns like "offer ABC123" or "A,B" etc.
  const ids: string[] = []
  const m = q.match(/offer\s+([A-Za-z0-9_-]+)/gi) || []
  for (const mm of m) {
    const id = mm.split(/\s+/).pop()
    if (id) ids.push(id)
  }
  // also accept bare tokens after "compare"/"сравни"/"taqqosla"
  if (/compare|сравн|taqqos/i.test(q)) {
    const after = q.split(/compare|сравн|taqqos/i).pop() || ""
    // Split by common separators: и, and, vs, comma, space
    const parts = after.split(/\s+(?:и|and|vs|,)\s+|\s+/)
    parts.forEach((t) => {
      const id = t.trim().replace(/[^A-Za-z0-9_-]/g, "")
      // Allow 1-24 char IDs (including single letters like "A", "B")
      if (id.length >= 1 && id.length <= 24 && /[A-Za-z]/.test(id)) {
        ids.push(id)
      }
    })
  }
  // dedupe
  return Array.from(new Set(ids))
}

function scoreIntent(q: string): IntentResult {
  const l = q.toLowerCase()
  const slots: Slots = {
    amount: extractAmount(q),
    termDays: extractTermDays(q),
    rail: extractRail(q),
    feeName: extractFee(q),
    offerIds: extractOfferIds(q),
    language: detectLanguage(q),
  }

  const reasons: string[] = []
  let intent: Intent = "unknown"
  let conf = 0.4

  if (/(what.*apr|explain.*apr|apr nə|что такое apr|apr nima|apr)/i.test(l)) {
    intent = "explain_apr"
    conf = 0.9
    reasons.push("matches APR explain")
  } else if (
    /(p2p.*bank|bank.*p2p|p2p.*vs.*bank|bank.*vs.*p2p|which rail|какой рельс|qaysi yo'l)/i.test(
      l
    )
  ) {
    intent = "bank_vs_p2p"
    conf = 0.78
    reasons.push("matches rail choice")
  } else if (/(compare|vs|сравн|taqqos)/i.test(l)) {
    intent = "compare_offers"
    conf = 0.85
    reasons.push("matches compare")
  } else if (
    /(fee|комисс|commission|transfer|cash[- ]?out|late|penalty)/i.test(l)
  ) {
    intent = "fee_explain"
    conf = 0.8
    reasons.push("matches fee")
  } else if (/(eligib|подхожу|прохожу|talab|score)/i.test(l)) {
    intent = "eligibility"
    conf = 0.75
    reasons.push("matches eligibility")
  } else if (/(how.*p2p|как.*p2p|qanday.*p2p|escrow.*work)/i.test(l)) {
    intent = "how_p2p_works"
    conf = 0.8
    reasons.push("matches how p2p works")
  } else if (
    /(privacy|policy|terms|риски|политик|maxfiylik|demo)/i.test(l)
  ) {
    intent = "policy_privacy"
    conf = 0.7
    reasons.push("matches policy/privacy")
  } else if (/(what is|что такое|nima degani|define)/i.test(l)) {
    intent = "glossary"
    conf = 0.6
    reasons.push("generic definition")
  } else if (
    /(hi|hello|привет|salom|thanks?|thank you|спасибо|rahmat|bye|goodbye)/i.test(
      l
    )
  ) {
    intent = "smalltalk"
    conf = 0.6
    reasons.push("greeting/smalltalk")
  }

  return { intent, slots, confidence: conf, reasons }
}

export function routeIntent(q: string): IntentResult {
  return scoreIntent(q)
}

export function suggestionsFor(intent: Intent): string[] {
  switch (intent) {
    case "explain_apr":
      return [
        "What is APR?",
        "Explain APR for Bank A",
        "How is APR calculated?",
      ]
    case "compare_offers":
      return [
        "Compare top 2 offers",
        "Compare Bank vs P2P",
        "Show me the cheapest option",
      ]
    case "fee_explain":
      return [
        "What are the fees?",
        "Explain transfer fee",
        "Show all charges",
      ]
    case "eligibility":
      return [
        "Why was I rejected?",
        "What are the requirements?",
        "Can I improve my score?",
      ]
    case "bank_vs_p2p":
      return ["Which is cheaper?", "Which is safer?", "Bank or P2P?"]
    case "how_p2p_works":
      return [
        "How does P2P work?",
        "What is escrow?",
        "How are lenders matched?",
      ]
    default:
      return [
        "Compare offers",
        "Explain APR",
        "What fees apply?",
        "Am I eligible?",
      ]
  }
}

