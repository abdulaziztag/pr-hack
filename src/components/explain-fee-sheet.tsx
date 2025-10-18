"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { NormalizedOffer, Rail } from "@/lib/types"
import { retrieveClauses, Retrieved } from "@/lib/retriever"
import { toPlainExplanation, explainApr } from "@/lib/explain"
import { incr } from "@/lib/analytics"
import NumberText from "@/components/intl/NumberText"

interface ExplainFeeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: string
  rail: Rail
  feeLabels: string[]
  normalizedOffer: NormalizedOffer
  termDays: number
}

export function ExplainFeeSheet({
  open,
  onOpenChange,
  provider,
  rail,
  feeLabels,
  normalizedOffer,
  termDays,
}: ExplainFeeSheetProps) {
  const [retrieved, setRetrieved] = useState<Retrieved[]>([])
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    if (open && !cached) {
      // Track analytics on open
      incr("explain_fee_opens")

      setLoading(true)
      retrieveClauses(
        {
          provider,
          rail,
          feeLabels,
          keywords: feeLabels,
        },
        3
      )
        .then((results) => {
          setRetrieved(results)
          setCached(true)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, cached, provider, rail, feeLabels])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Fee Breakdown: {provider}</SheetTitle>
          <SheetDescription>
            Plain-language explanation with source citations
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Key Clauses */}
          <section>
            <h3 className="mb-3 font-semibold">Key Clauses</h3>
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            )}
            {!loading && retrieved.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No relevant clauses found in the corpus.
              </p>
            )}
            {!loading &&
              retrieved.map((r, idx) => (
                <div
                  key={r.entry.id}
                  className="mb-3 rounded-lg border p-4"
                  role="article"
                  aria-label={`Clause ${idx + 1}: ${r.entry.title}`}
                >
                  <p className="text-sm">{toPlainExplanation(r.entry)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    — {r.entry.citation} (section: {r.entry.section})
                  </p>
                </div>
              ))}
          </section>

          {/* Why This APR */}
          <section>
            <h3 className="mb-3 font-semibold">Why This APR?</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {explainApr(normalizedOffer, termDays)}
            </p>

            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-3 text-sm font-semibold">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal:</span>
                  <NumberText 
                    value={normalizedOffer.breakdown.principal} 
                    suffix=" UZS"
                    className="font-mono"
                  />
                </div>
                {normalizedOffer.breakdown.upfrontFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Upfront Fees:
                    </span>
                    <NumberText 
                      value={normalizedOffer.breakdown.upfrontFees} 
                      suffix=" UZS"
                      className="font-mono"
                    />
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest:</span>
                  <NumberText 
                    value={normalizedOffer.breakdown.interest} 
                    suffix=" UZS"
                    className="font-mono"
                  />
                </div>
                {normalizedOffer.breakdown.usageFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usage Fees:</span>
                    <NumberText 
                      value={normalizedOffer.breakdown.usageFees} 
                      suffix=" UZS"
                      className="font-mono"
                    />
                  </div>
                )}
                {normalizedOffer.breakdown.closingFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing Fees:</span>
                    <NumberText 
                      value={normalizedOffer.breakdown.closingFees} 
                      suffix=" UZS"
                      className="font-mono"
                    />
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total to Repay:</span>
                  <NumberText 
                    value={normalizedOffer.totalRepay} 
                    suffix=" UZS"
                    className="font-mono"
                  />
                </div>
                <div className="flex justify-between text-primary">
                  <span>APR:</span>
                  <NumberText 
                    value={normalizedOffer.aprPct} 
                    decimals={1}
                    suffix="%"
                    className="font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p>
              <strong>Not advice • Demo only</strong> — This is a demonstration
              application. Fees and terms are simulated for educational
              purposes. Always review official loan documents and seek
              professional advice.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
