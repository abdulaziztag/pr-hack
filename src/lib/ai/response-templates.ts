import type { Intent } from "./intent-types"
import { HIDE_DEMO_COPY } from "@/lib/config"

export interface PlanSection {
  id: string
  title: string
  bullets: string[] // prompts for bullets (what to cover)
  wantTable?: boolean // ask model to include a fljson table if applicable
}

export interface ResponsePlan {
  intent: Intent
  language: "uz" | "ru" | "en"
  sections: PlanSection[]
  maxBulletsPerSection: number
  maxChars: number // soft cap (UI will still stream, but we instruct to keep under this)
}

/** Minimal i18n for section headings. */
const T = {
  en: {
    apr_basics: "APR basics",
    fee_breakdown: "Fee breakdown",
    comparison: "Comparison",
    result: "Result",
    why: "Why this ranking",
    eligibility: "Eligibility",
    how_p2p: "How P2P works",
    privacy: "Privacy",
    actions: "Next steps",
  },
  ru: {
    apr_basics: "Что такое APR",
    fee_breakdown: "Разбор комиссий",
    comparison: "Сравнение",
    result: "Итог",
    why: "Почему такой порядок",
    eligibility: "Доступность",
    how_p2p: "Как работает P2P",
    privacy: "Приватность",
    actions: "Дальшие шаги",
  },
  uz: {
    apr_basics: "APR nima",
    fee_breakdown: "To'lovlar tahlili",
    comparison: "Taqqoslash",
    result: "Natija",
    why: "Nega shunday",
    eligibility: "Moslik",
    how_p2p: "P2P qanday ishlaydi",
    privacy: "Maxfiylik",
    actions: "Keyingi qadamlar",
  },
} as const

export function buildResponsePlan(
  intent: Intent,
  lang: "uz" | "ru" | "en"
): ResponsePlan {
  const L = T[lang] ?? T.en
  const base = { maxBulletsPerSection: 4, maxChars: 900 }

  switch (intent) {
    case "compare_offers":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "result",
            title: L.result,
            bullets: ["State top choice succinctly with reason (cost)."],
          },
          {
            id: "comparison",
            title: L.comparison,
            bullets: ["Provider, rail, APR %, total UZS, term days."],
            wantTable: true,
          },
          {
            id: "why",
            title: L.why,
            bullets: [
              "Key delta vs next offer (APR/total).",
              "Any fees driving difference.",
            ],
          },
          {
            id: "actions",
            title: L.actions,
            bullets: ["Propose next click (Open P2P or Apply with Bank)."],
          },
        ],
      }
    case "fee_explain":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "fee",
            title: L.fee_breakdown,
            bullets: [
              "What the fee covers.",
              "How often/when charged.",
              "Impact on APR (short tenor).",
            ],
          },
          {
            id: "actions",
            title: L.actions,
            bullets: ["Suggest cheaper rail/flow if relevant."],
          },
        ],
      }
    case "explain_apr":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "apr",
            title: L.apr_basics,
            bullets: [
              "One-sentence definition.",
              "What inputs matter (fees, tenor).",
            ],
          },
          {
            id: "actions",
            title: L.actions,
            bullets: ["Offer to compute APR for current amount/term."],
          },
        ],
      }
    case "eligibility":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "elig",
            title: L.eligibility,
            bullets: ["State pass/fail if known.", "What to tweak (amount/term)."],
          },
          {
            id: "actions",
            title: L.actions,
            bullets: ["Link to filter or re-run offers."],
          },
        ],
      }
    case "bank_vs_p2p":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "result",
            title: L.result,
            bullets: [
              "Which rail seems cheaper now.",
              "Any fee caveats (transfer/cash-out).",
            ],
          },
          {
            id: "why",
            title: L.why,
            bullets: ["Key tradeoffs: speed, fees, flexibility."],
          },
          {
            id: "actions",
            title: L.actions,
            bullets: ["Open P2P or filter BANK."],
          },
        ],
      }
    case "how_p2p_works":
      return {
        intent,
        language: lang,
        ...base,
        sections: HIDE_DEMO_COPY
          ? [
              {
                id: "how",
                title: L.how_p2p,
                bullets: ["Escrow steps in bullets.", "Lender matching process."],
              },
            ]
          : [
              {
                id: "how",
                title: L.how_p2p,
                bullets: ["Escrow steps in bullets.", "No real funds in demo."],
              },
              {
                id: "privacy",
                title: L.privacy,
                bullets: ["No PII persistence; demo only."],
              },
            ],
      }
    case "policy_privacy":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "privacy",
            title: L.privacy,
            bullets: HIDE_DEMO_COPY
              ? ["Local session storage.", "Data remains on your device."]
              : ["Demo only; no real funds.", "Local session storage."],
          },
        ],
      }
    case "glossary":
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          {
            id: "result",
            title: L.result,
            bullets: ["Short definition.", "1 short example."],
          },
        ],
      }
    default:
      return {
        intent,
        language: lang,
        ...base,
        sections: [
          { id: "result", title: L.result, bullets: ["Answer briefly."] },
        ],
      }
  }
}

/** Compact style guide that we inject to system. */
export function styleGuide(plan: ResponsePlan) {
  return [
    `STYLE: concise, factual, 1–${plan.maxBulletsPerSection} bullets per section, total under ${plan.maxChars} chars.`,
    `NUMBERS: use provided formatting in UI; don't add currency symbols inside fljson cells.`,
    `STRUCTURE: follow sections in order; if wantTable=true, include a fljson table in that section.`,
    `CITATIONS: keep [^id] markers near facts when grounded.`,
    `SAFETY: if data is missing, say so and propose a next UI action.`,
  ].join(" ")
}

