#!/usr/bin/env node

// Clears sessionStorage via a small HTML page instruction; fallback prints note.
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    RESET DEMO DATA                             ║
╚════════════════════════════════════════════════════════════════╝

Reset from the UI:
  1. Open http://localhost:3000/admin/export
  2. Click "Reset All Demo Data" button

OR

  1. Open http://localhost:3000/demo
  2. Click "Reset Demo" button

(Programmatic reset is runtime-only; this script is a placeholder for CI.)

Note: All data is stored in sessionStorage and clears automatically
when you close the browser tab.
`)

process.exit(0)

