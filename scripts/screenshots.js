#!/usr/bin/env node

// Optional placeholder: instructs judges to capture screens manually.
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  SCREENSHOT INSTRUCTIONS                       ║
╚════════════════════════════════════════════════════════════════╝

Recommended pages to capture for evaluation:

1. DEMO SCRIPT SUMMARY
   → http://localhost:3000/demo
   → Click "Run Script" and capture the summary output

2. RANKED OFFERS
   → http://localhost:3000/offers
   → Shows eligible vs ineligible offers with reasons

3. P2P PLEDGE SIMULATION
   → http://localhost:3000/p2p
   → After posting request and simulating pledges

4. ESCROW RELEASE CONDITIONS
   → http://localhost:3000/p2p/escrow/[id]
   → Replace [id] with actual escrow ID from P2P flow

5. ADMIN TARIFF PARSER
   → http://localhost:3000/admin/tariffs
   → APR preview table showing computed rates

6. EXPLAIN FEE SHEET
   → Click "Explain this fee" on any offer card
   → Shows clause retrieval with citations

Tip: Use browser dev tools (Cmd/Ctrl+Shift+P → "Capture screenshot")
or a tool like Flameshot/Snagit for high-quality captures.

(We avoid puppeteer/playwright to keep zero network/deps.)
`)

process.exit(0)

