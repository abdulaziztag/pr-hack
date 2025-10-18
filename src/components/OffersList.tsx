"use client"

import Link from "next/link"
import { ArrowLeft, AlertCircle, Edit2 } from "lucide-react"
import { OfferCard } from "@/components/offer-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Applicant, NormalizedOffer, RawOffer } from "@/lib/types"
import { EligibilityResult } from "@/lib/eligibility"
import NumberText from "@/components/intl/NumberText"

interface EligibleOffer extends NormalizedOffer {
  rawOffer: RawOffer
  eligibility: EligibilityResult
}

interface OffersListProps {
  applicant: Applicant
  eligibleOffers: EligibleOffer[]
  ineligibleOffers: EligibleOffer[]
  onSelectOffer: (offer: NormalizedOffer) => void
}

export default function OffersList({
  applicant,
  eligibleOffers,
  ineligibleOffers,
  onSelectOffer,
}: OffersListProps) {
  const showScoreWarning = applicant.score < 500

  return (
    <div className="h-full">
      {/* Summary Header */}
      <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/apply">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back to Application
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/apply">
                <Edit2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit Inputs
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Amount:</span>{" "}
              <span className="font-semibold">
                <NumberText value={applicant.amount} suffix=" UZS" />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Term:</span>{" "}
              <span className="font-semibold">
                <NumberText value={applicant.termDays} suffix=" days" />
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Your Score:</span>{" "}
              <NumberText
                value={applicant.score}
                className={`font-semibold ${
                  applicant.score >= 700
                    ? "text-green-600 dark:text-green-400"
                    : applicant.score >= 500
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              />
            </div>
            <div>
              <Badge
                variant={
                  applicant.bucket === "A"
                    ? "default"
                    : applicant.bucket === "B"
                      ? "secondary"
                      : "outline"
                }
              >
                Bucket {applicant.bucket}
              </Badge>
            </div>
          </div>
          {eligibleOffers.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing eligible offers first. Change intake to see more options.
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">Your Loan Offers</h1>
            <Badge variant="outline" className="text-xs">
              Transparent APR • Simulation
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Ranked by true APR • Amounts shown in UZS • Demo only
          </p>
          <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/20">
            <p className="text-blue-700 dark:text-blue-300">
              <strong>P2P offers:</strong> Selecting a P2P offer will attempt to
              match your request from active lender offers. If no matches are
              available, a simulated pool fallback is provided.
            </p>
          </div>
        </div>

        {/* Score Warning */}
        {showScoreWarning && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  Limited Availability
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Some offers may be unavailable with your current score (
                  {applicant.score}). Consider improving your profile or
                  adjusting loan parameters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Eligible Offers */}
        {eligibleOffers.length > 0 && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">
              Eligible Offers ({eligibleOffers.length})
            </h2>
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {eligibleOffers.map((offer, index) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  rank={index + 1}
                  termDays={applicant.termDays}
                  onSelect={() => onSelectOffer(offer)}
                />
              ))}
            </div>
          </>
        )}

        {/* Ineligible Offers */}
        {ineligibleOffers.length > 0 && (
          <>
            <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
              Unavailable ({ineligibleOffers.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {ineligibleOffers.map((offer, index) => (
                <div key={offer.id} className="relative opacity-60">
                  <div className="pointer-events-none">
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      rank={index + 1}
                      termDays={applicant.termDays}
                      onSelect={() => {}}
                    />
                  </div>
                  <div className="mt-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="mb-1 text-sm font-semibold text-destructive">
                      Not Eligible
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                      {offer.eligibility.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No Offers */}
        {eligibleOffers.length === 0 && ineligibleOffers.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">
              No Offers Available
            </h2>
            <p className="text-muted-foreground">
              No lenders match your request. Try adjusting the amount or term.
            </p>
            <Button asChild className="mt-4">
              <Link href="/apply">Modify Application</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

