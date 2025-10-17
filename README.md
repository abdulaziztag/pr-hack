# FairLend

**Rail-neutral micro-credit comparator with P2P simulation (hackathon demo)**

A transparent lending comparison platform that ranks bank and peer-to-peer loan offers by true APR, simulates P2P escrow flows, and provides explainable fee breakdowns using local knowledge retrieval.

---

## 🔒 Demo Safety

**Simulation only. No real funds or networking.**

This is a demonstration application built for hackathon evaluation. All data is local and stored in `sessionStorage`. No external APIs are called, no real money is involved, and no personal data leaves your browser.

- ✅ All offers are mocked
- ✅ Credit scores are deterministic formulas
- ✅ P2P lenders are simulated
- ✅ Network access is blocked by design
- ✅ Reset button clears all demo data

---

## 🚀 Quick Start

```bash
npm install
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Judge Script (One-Click Demo Flow)

**Fastest way to evaluate the application:**

1. Navigate to [/demo](http://localhost:3000/demo)
2. Select a preset (default: "Baseline — 3.5M UZS / 30 days / employed")
3. Click **"Run Script"** → complete flow executes automatically
4. Review the summary output showing:
   - Applicant profile (score, bucket, amount, term, income)
   - Eligible offers ranked by APR
   - Ineligible offers with reasons
   - P2P escrow simulation (if eligible)
   - Analytics counters
5. Click **"Open Offers"** to see the offers page
6. Click **"Open P2P Escrow"** to see escrow details (if P2P was eligible)
7. Copy the plaintext summary for evaluation

**Alternative: Manual Flow**

1. Start at [/apply](http://localhost:3000/apply)
2. Fill form → Submit → View ranked offers
3. Select a P2P offer → Post borrow request → Simulate pledges
4. View escrow conditions → Release funds

---

## ✨ Feature Map

### Core Features

- **Intake → APR Engine → Ranked Offers (Rail-Neutral)**
  - Unified application form collecting amount, term, income, employment, behavior
  - Deterministic credit scoring (300-900 scale, A-D buckets)
  - APR normalization across bank and P2P offers (daily/monthly/upfront fees → annualized rate)
  - Ranked by true APR, eligible first

- **P2P Pledge & Escrow Simulation**
  - Post borrow request with applicant risk profile
  - Deterministic lender pledge generation (7+ lenders, weighted by score/term)
  - Escrow state machine: PENDING → FUNDED → RELEASE_READY → RELEASED
  - Release conditions: borrower confirmation, cooling-off, no dispute

- **Clause Explainer (Local RAG-lite)**
  - Local JSON corpus (bank-a.json, bank-b.json, p2p.json)
  - Lexical retriever with TF-IDF scoring
  - "Explain this fee" sheet shows relevant clauses with citations
  - Plain language APR breakdown

- **Admin Tariff Parser (Mock)**
  - Paste tariff text → regex-based pattern recognition
  - Normalize fees into `RawOffer[]` with validation
  - Preview computed APRs for different amounts/terms
  - Versioned storage in `sessionStorage`
  - Export/import JSON for data portability

- **Eligibility & Scoring Layer**
  - Deterministic credit score from intake data (affordability, employment, behavior)
  - Offer-specific rules: minScore, maxAmtToIncome, allowedEmployment, disallowDelinquency
  - Explicit ineligibility reasons shown to user
  - Eligible vs unavailable UI segregation

- **Compliance & Demo Safety**
  - Network access blocked (`guardedFetch` throws)
  - PII masking (phone, ID) in UI and logs
  - Audit log (sessionStorage) for all key actions
  - Global "Simulation Only" banner
  - Reset button clears all data

- **Accessibility (WCAG 2.2 AA Basics)**
  - Skip to main content link
  - One `<h1>` per page, semantic landmarks
  - Live announcements for screen readers (apply submit, offers load, escrow release)
  - Keyboard navigation with visible focus rings
  - Form labels, hints, errors with ARIA
  - Reduced motion support

- **Analytics & Judge Script**
  - Lightweight counters: apply_submits, offers_views, explain_fee_opens, p2p_posts, p2p_funded, escrow_release, admin_tariffs_save
  - Deterministic demo presets (Baseline, Student, High Amount)
  - One-click script execution with plaintext summary output
  - Navigation helpers to pre-populated pages

---

## 🛠 Tech Stack

- **Framework**: Next.js 14.2 (App Router, React 18, Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components (Radix UI primitives)
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint (Next.js config + jsx-a11y)
- **Formatting**: Prettier + Tailwind class sorting
- **Git Hooks**: Husky + lint-staged (pre-commit checks)
- **CI**: GitHub Actions (Node 20, lint/test/build)
- **Storage**: sessionStorage only (no databases, no backend)
- **Dependencies**: Zero external APIs, zero network calls

---

## 📜 Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint + TypeScript checks
npm run format       # Prettier formatting
npm test             # Run Jest tests

# Demo & Utilities
npm run demo         # Alias for dev (judge convenience)
npm run reset        # Instructions to reset demo data
npm run screens      # Instructions for capturing screenshots
npm run ci           # Full CI pipeline (lint + test + build)
```

---

## 🗺 Routes

### User Flows

- `/` — Home (overview, CTA to apply)
- `/apply` — Loan application form (intake)
- `/offers` — Ranked loan offers (eligible first, then unavailable with reasons)
- `/p2p` — P2P borrow request (post → simulate pledges)
- `/p2p/escrow/[id]` — Escrow detail page (conditions, release)

### Admin & Tooling

- `/admin` — Admin landing page
- `/admin/tariffs` — Tariff parser (paste text → parse → preview APR → save version)
- `/admin/export` — Export/import tariff versions (JSON)
- `/admin/audit` — View audit log (all user actions)

### Demo

- `/demo` — Judge Script (one-click preset execution)

### Meta

- `/pricing` — Example pricing page (static demo)

---

## 📝 Notes for Evaluators

### What's Mocked vs Real

**Mocked (Simulated)**

- All loan offers (`MOCK_OFFERS` in `src/lib/mockOffers.ts`)
- Lender pledges (deterministic based on score/term/amount)
- Credit scores (formula-based, no external bureau)
- Network calls (blocked by `guardedFetch`)
- Tariff parsing (regex patterns, no OCR)

**Real (Functional)**

- APR calculation engine (accurate simple interest annualization)
- Eligibility evaluation (deterministic rule engine)
- Escrow state machine (proper state transitions)
- Retrieval system (TF-IDF lexical search on local corpus)
- Accessibility features (WCAG 2.2 AA basics)
- All UI interactions and navigation

### Where to Find Key Data

- **Audit Log**: `/admin/audit` or `sessionStorage.getItem('fairlend.audit.v1')`
- **Analytics**: `/demo` summary or `sessionStorage.getItem('fairlend.analytics.v1')`
- **Intake Data**: `sessionStorage.getItem('fairlend.intake')`
- **Tariff Versions**: `sessionStorage.getItem('fairlend.tariffs.v1')`
- **Escrows**: `sessionStorage.getItem('fairlend.p2p.escrows')`

### Testing the Full Stack

1. **Intake & Scoring**: Apply with different profiles, verify deterministic scores
2. **APR Engine**: Check offers page, verify ranking by APR (eligible first)
3. **Eligibility**: Apply with low score/high debt ratio, see ineligibility reasons
4. **P2P Flow**: Select P2P offer, verify pledge simulation, escrow creation
5. **Explainer**: Click "Explain this fee", verify clause retrieval and citations
6. **Admin Tools**: Parse a tariff, preview APR, save version, export/import
7. **Accessibility**: Tab through forms, use screen reader, check focus rings
8. **Analytics**: Run judge script, verify counters increment

---

## 📦 Project Structure

```
fair-lend-front/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Home
│   │   ├── apply/                # Intake form
│   │   ├── offers/               # Ranked offers
│   │   ├── p2p/                  # P2P flow & escrow
│   │   ├── admin/                # Admin tools
│   │   ├── demo/                 # Judge script
│   │   ├── layout.tsx            # Root layout
│   │   ├── error.tsx             # Error boundary
│   │   └── not-found.tsx         # 404 page
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── intake-form.tsx       # Application form
│   │   ├── offer-card.tsx        # Offer display
│   │   ├── explain-fee-sheet.tsx # Fee explanation modal
│   │   └── ...
│   ├── lib/                      # Business logic & utilities
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── apr.ts                # APR calculation
│   │   ├── scoring.ts            # Credit scoring
│   │   ├── eligibility.ts        # Eligibility rules
│   │   ├── escrow.ts             # P2P escrow state
│   │   ├── retriever.ts          # Local RAG retriever
│   │   ├── judge.ts              # Judge script orchestrator
│   │   └── ...
│   ├── data/                     # Local corpus
│   │   └── terms/                # Fee clauses (JSON)
│   ├── styles/                   # Global CSS
│   │   └── globals.css           # Tailwind + theme tokens
│   └── tests/                    # Jest tests
├── public/                       # Static assets
├── scripts/                      # Utility scripts
├── .github/workflows/            # CI/CD
└── ...config files
```

---

## 🧪 Testing

All core logic is unit tested with Jest + React Testing Library:

- APR calculation & ranking (`src/tests/apr.test.ts`)
- Credit scoring & bucketing (`src/tests/scoring.test.ts`)
- Eligibility evaluation (`src/tests/eligibility.test.ts`)
- Escrow state machine (`src/tests/escrow.test.ts`)
- Retriever & explainer (`src/tests/retriever.test.ts`, `src/tests/explain.test.ts`)
- Tariff parser & validator (`src/tests/parser.test.ts`, `src/tests/validate.test.ts`)
- Analytics & judge script (`src/tests/analytics.test.ts`, `src/tests/judge.test.ts`)
- Accessibility smoke tests (`src/tests/a11y.ui.test.tsx`, `src/tests/keyboard.flow.test.tsx`)

Run all tests:

```bash
npm test
```

---

## 🚨 Known Limitations (By Design)

- **No Real Data**: All offers, scores, and lenders are simulated
- **No Persistence**: Data clears when you close the tab (sessionStorage only)
- **No Backend**: Pure frontend demo, no API server
- **No Auth**: No login, no user accounts
- **No Production Deploy**: Localhost only (no Vercel/Netlify config)
- **Limited Corpus**: Fee explanations only cover 3 demo providers
- **Regex Parsing**: Tariff parser uses patterns, not ML/OCR

These are intentional constraints for a hackathon demo focused on UX and logic, not production infrastructure.

---

## 🤝 Contributing

This is a demonstration project for hackathon evaluation. If you find issues or have suggestions:

1. Fork the repo
2. Create a feature branch
3. Run `npm run ci` to ensure quality
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Lucide](https://lucide.dev/) - Icon library

---

**Questions? Issues?** Open a GitHub issue or check the [/demo](http://localhost:3000/demo) page for a quick walkthrough.
