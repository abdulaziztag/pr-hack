export interface RagDoc {
  id: string // stable id, e.g., "bank_uz_transfer_fee_v1"
  title: string // human title
  source: string // short source tag (e.g., "Demo Tariff", "P2P Policy")
  url?: string // optional relative link (e.g., "/docs/fees#transfer")
  text: string // plain text blob (<= 2–4 KB per doc)
}

export const CORPUS: RagDoc[] = [
  {
    id: "bank_transfer_fee_v1",
    title: "Bank Microloan: Card Transfer Fee",
    source: "Demo Tariff",
    url: "/docs/fees#transfer",
    text: `A transfer fee is charged when moving microloan funds to a card or account. Typical ranges are 3–5% upfront.
An upfront 5% fee over a 30-day cycle simple-annualizes to ~60% before other charges.
If the loan is repaid earlier than term, the upfront fee is not prorated.`,
  },
  {
    id: "bank_grace_period_v1",
    title: "Grace Period vs. Effective APR",
    source: "Demo Tariff",
    url: "/docs/fees#grace",
    text: `A 0% 'grace period' can still carry one-time fees. If funds are disbursed to a card with a transfer fee,
the effective APR may be non-zero. Always compute Total to Repay and normalized APR.`,
  },
  {
    id: "p2p_escrow_v1",
    title: "P2P Escrow Flow (Demo)",
    source: "P2P Policy",
    url: "/docs/p2p#escrow",
    text: `In P2P, funds are held in escrow until release conditions: borrower confirmation or time-based release.
No real funds in demo. Steps: fund escrow → verify → disburse → repay to escrow → release to lender.`,
  },
  {
    id: "eligibility_rules_v1",
    title: "Eligibility (Demo)",
    source: "Eligibility",
    url: "/docs/eligibility#basic",
    text: `Minimum amount 100,000 UZS; minimum term 7 days. Some offers may require card verification and KYC-lite.
Eligibility varies by provider and may exclude certain transaction types.`,
  },
  {
    id: "apr_definition_v1",
    title: "APR Definition (Normalized)",
    source: "Docs",
    url: "/docs/apr#definition",
    text: `APR is the annualized cost including all fees, normalized to a yearly rate.
For single-bullet demo loans we compute cash-in vs. total repay, annualize by 365/termDays.`,
  },
  {
    id: "privacy_demo_v1",
    title: "Demo Privacy & No Real Funds",
    source: "Policy",
    url: "/docs/policy#demo",
    text: `This is a demo. No real funds move. We do not persist personal data; local sessionStorage is used for UX only.
Explanations are informational and not credit advice.`,
  },
  {
    id: "p2p_matching_v1",
    title: "P2P Matching Engine",
    source: "P2P Policy",
    url: "/docs/p2p#matching",
    text: `P2P matching allocates borrower requests to lender offers using a greedy then pro-rata strategy.
Lenders set their own rates and capacity. The platform simulates matching deterministically.`,
  },
  {
    id: "late_penalty_v1",
    title: "Late Payment Penalties",
    source: "Demo Tariff",
    url: "/docs/fees#late",
    text: `Late payment penalties typically accrue daily at 0.1% of the overdue amount, or as a flat fee.
Compounding can significantly increase total cost. Always repay on time to avoid penalties.`,
  },
  {
    id: "cash_out_fee_v1",
    title: "Cash-Out ATM Fee",
    source: "Demo Tariff",
    url: "/docs/fees#cashout",
    text: `ATM cash withdrawals may incur a 1–2% fee plus ATM provider charges.
For microloans, prefer direct merchant payments to minimize fees. Cash-out fees are non-refundable.`,
  },
  {
    id: "kyc_requirements_v1",
    title: "KYC & Verification (Simulation)",
    source: "Policy",
    url: "/docs/policy#kyc",
    text: `In production, KYC involves identity verification, address proof, and source of funds.
This demo simulates KYC with minimal inputs. Real implementations must comply with local AML/CFT regulations.`,
  },
]

