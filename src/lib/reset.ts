/**
 * Reset all demo data stored in sessionStorage.
 * Clears intake, P2P state, tariffs, and audit log.
 */
export function resetDemo() {
  const keys = [
    "fairlend.intake",
    "fairlend.p2p.intent",
    "fairlend.p2p.requests",
    "fairlend.p2p.escrows",
    "fairlend.tariffs.v1",
    "fairlend.audit.v1",
  ]

  if (typeof window !== "undefined") {
    keys.forEach((k) => sessionStorage.removeItem(k))
    window.location.href = "/"
  }
}

