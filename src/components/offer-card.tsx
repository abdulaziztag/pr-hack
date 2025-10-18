"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NormalizedOffer } from "@/lib/types"
import { ExplainFeeSheet } from "./explain-fee-sheet"
import NumberText from "@/components/intl/NumberText"

interface OfferCardProps {
  offer: NormalizedOffer
  rank: number
  termDays: number
  onSelect?: () => void
}

export function OfferCard({ offer, rank, termDays, onSelect }: OfferCardProps) {
  const [showFees, setShowFees] = useState(false)

  return (
    <>
      <Card className="group relative rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {offer.provider}
              </CardTitle>
              <div className="mt-1.5">
                <span className="pill bg-muted/60">
                  {offer.rail === "P2P" ? "P2P" : "BANK"}
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
              #{rank}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                APR
              </div>
              <div className="text-3xl font-semibold tracking-tight">
                <NumberText value={offer.aprPct} decimals={1} suffix="%" />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                Total to Repay
              </div>
              <div className="text-xl font-medium">
                <NumberText value={offer.totalRepay} suffix=" UZS" className="text-foreground" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Breakdown
            </div>
            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Principal:</span>
                <span className="font-medium text-foreground">
                  <NumberText value={offer.breakdown.principal} suffix=" UZS" />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Interest:</span>
                <span className="font-medium text-foreground">
                  <NumberText value={offer.breakdown.interest} suffix=" UZS" />
                </span>
              </div>
              {offer.breakdown.upfrontFees > 0 && (
                <div className="flex justify-between">
                  <span>Upfront Fees:</span>
                  <span className="font-medium text-foreground">
                    <NumberText value={offer.breakdown.upfrontFees} suffix=" UZS" />
                  </span>
                </div>
              )}
              {offer.breakdown.usageFees > 0 && (
                <div className="flex justify-between">
                  <span>Usage Fees:</span>
                  <span className="font-medium text-foreground">
                    <NumberText value={offer.breakdown.usageFees} suffix=" UZS" />
                  </span>
                </div>
              )}
              {offer.breakdown.closingFees > 0 && (
                <div className="flex justify-between">
                  <span>Closing Fees:</span>
                  <span className="font-medium text-foreground">
                    <NumberText value={offer.breakdown.closingFees} suffix=" UZS" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setShowFees(true)}
            aria-label={`Explain fees for ${offer.provider}`}
          >
            <Info className="mr-2 h-4 w-4" aria-hidden="true" />
            Explain this fee
          </Button>
          <Button 
            className="btn-brand flex-1 rounded-md px-4 py-2 text-sm font-medium" 
            onClick={onSelect}
          >
            Select Offer
          </Button>
        </CardFooter>
      </Card>

      <ExplainFeeSheet
        open={showFees}
        onOpenChange={setShowFees}
        provider={offer.provider}
        rail={offer.rail}
        feeLabels={offer.feeClauses.map((c) => c.label)}
        normalizedOffer={offer}
        termDays={termDays}
      />
    </>
  )
}
