/**
 * Build a minimal, privacy-safe snapshot of current offers & intake to send in system context.
 * Do NOT include PII. Only include fields needed for reasoning.
 */
export interface OfferMini {
  id: string
  provider: string // e.g. bank name or "P2P"
  rail: "BANK" | "P2P"
  aprPct?: number // normalized APR %
  totalRepay?: number // UZS
  termDays?: number
}

export interface IntakeMini {
  amount?: number
  termDays?: number
}

export interface OffersSnapshot {
  intake: IntakeMini
  offers: OfferMini[]
}

export function buildOffersSnapshot(): OffersSnapshot {
  if (typeof window === "undefined") {
    return { intake: {}, offers: [] }
  }

  try {
    const intakeRaw = sessionStorage.getItem("fairlend.intake")
    const intake = intakeRaw ? JSON.parse(intakeRaw) : {}

    // Try to get offers from sessionStorage (if stored) or reconstruct from page
    let offersData: unknown[] = []

    // Check if offers are stored
    const offersRaw = sessionStorage.getItem("fairlend.offers")
    if (offersRaw) {
      try {
        offersData = JSON.parse(offersRaw)
      } catch {
        // Ignore
      }
    }

    // Sanitize shape
    const mini = Array.isArray(offersData)
      ? offersData.slice(0, 12).map((o: unknown) => {
          const offer = o as Record<string, unknown>
          return {
            id: String(offer.id ?? ""),
            provider: String(
              offer.provider ??
                offer.bank ??
                offer.name ??
                (offer.rail || "Offer")
            ),
            rail: (offer.rail === "P2P" ? "P2P" : "BANK") as const,
            aprPct:
              typeof offer.aprPct === "number"
                ? Math.round(offer.aprPct * 100) / 100
                : undefined,
            totalRepay:
              typeof offer.totalRepay === "number"
                ? Math.round(offer.totalRepay)
                : undefined,
            termDays:
              typeof offer.termDays === "number" ? offer.termDays : undefined,
          }
        })
      : []

    return {
      intake: { amount: intake?.amount, termDays: intake?.termDays },
      offers: mini,
    }
  } catch {
    return { intake: {}, offers: [] }
  }
}

