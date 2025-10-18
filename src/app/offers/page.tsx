"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { announce } from "@/lib/announce"
import { incr } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Applicant, NormalizedOffer, P2PIntent, RawOffer } from "@/lib/types"
import { MOCK_OFFERS } from "@/lib/mockOffers"
import { normalizeOffer, rankOffers } from "@/lib/apr"
import { evaluateEligibility, EligibilityResult } from "@/lib/eligibility"
import { logAudit } from "@/lib/audit"
import SplitPane from "@/components/layout/SplitPane"
import ChatDock from "@/components/chat/ChatDock"
import PrivacyBanner from "@/components/chat/PrivacyBanner"
import ChatErrorBoundary from "@/components/chat/ErrorBoundary"
import OffersList from "@/components/OffersList"
import OffersChatTabs from "@/components/chat/OffersChatTabs"
import RequireAuth from "@/components/auth/RequireAuth"

interface EligibleOffer extends NormalizedOffer {
  rawOffer: RawOffer
  eligibility: EligibilityResult
}

export default function OffersPage() {
  const router = useRouter()
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [eligibleOffers, setEligibleOffers] = useState<EligibleOffer[]>([])
  const [ineligibleOffers, setIneligibleOffers] = useState<EligibleOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("fairlend.intake")
      if (stored) {
        try {
          const data = JSON.parse(stored) as Applicant
          setApplicant(data)

          // Evaluate eligibility and normalize offers
          const withEligibility = MOCK_OFFERS.map((offer) => {
            const eligibility = evaluateEligibility(offer, data)
            const normalized = normalizeOffer(offer, data.amount, data.termDays)
            return {
              ...normalized,
              rawOffer: offer,
              eligibility,
            } as EligibleOffer
          })

          // Split into eligible and ineligible, then rank each by APR
          const eligible = withEligibility.filter((o) => o.eligibility.eligible)
          const ineligible = withEligibility.filter(
            (o) => !o.eligibility.eligible
          )

          setEligibleOffers(rankOffers(eligible) as EligibleOffer[])
          setIneligibleOffers(rankOffers(ineligible) as EligibleOffer[])

          // Log audit event
          logAudit("OFFERS_VIEW", {
            eligibleCount: eligible.length,
            ineligibleCount: ineligible.length,
          })

          // Announce to screen readers
          announce(
            `Offers loaded and ranked by APR. ${eligible.length} eligible offer${eligible.length === 1 ? "" : "s"} available.`
          )

          // Track analytics
          incr("offers_views")
        } catch (error) {
          console.error("Failed to parse intake data:", error)
        }
      }
      setLoading(false)
    }
  }, [])

  const handleSelectOffer = (offer: NormalizedOffer) => {
    if (offer.rail === "P2P") {
      // Store P2P intent and navigate to P2P flow
      const intent: P2PIntent = {
        amount: applicant!.amount,
        termDays: applicant!.termDays,
        score: applicant!.score,
        offerId: offer.id,
      }
      sessionStorage.setItem("fairlend.p2p.intent", JSON.stringify(intent))
      router.push("/p2p/borrow")
    } else {
      // For bank offers, just show a placeholder for now
      alert(
        `Bank offer selected: ${offer.provider}\nIn production, this would proceed to the bank's application flow.`
      )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-muted-foreground">Loading offers...</p>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">No Application Found</h1>
          <p className="mb-6 text-muted-foreground">
            Please complete the application form first.
          </p>
          <Button asChild>
            <Link href="/apply">Go to Application</Link>
          </Button>
        </div>
      </div>
    )
  }

  const offersListContent = (
    <OffersList
      applicant={applicant}
      eligibleOffers={eligibleOffers}
      ineligibleOffers={ineligibleOffers}
      onSelectOffer={handleSelectOffer}
    />
  )

  const chatContent = (
    <div className="flex h-full flex-col">
      <PrivacyBanner />
      <ChatErrorBoundary>
        <ChatDock className="flex-1" />
      </ChatErrorBoundary>
    </div>
  )

  return (
    // eslint-disable-next-line jsx-a11y/aria-role
    <RequireAuth role="user">
      <div className="h-[calc(100vh-56px)]">
        {/* Desktop: Split view with resizable pane */}
        <SplitPane
          className="h-full"
          left={offersListContent}
          right={chatContent}
          storageKey="fairlend.offers.split"
        />

        {/* Mobile: Tabbed view */}
        <div className="md:hidden h-full">
          <OffersChatTabs
            offersContent={offersListContent}
            chatContent={chatContent}
          />
        </div>
      </div>
    </RequireAuth>
  )
}
