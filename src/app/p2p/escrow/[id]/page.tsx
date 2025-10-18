"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { PledgeTable } from "@/components/pledge-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Escrow } from "@/lib/types"
import { getEscrowById, setConditions, releaseFunds } from "@/lib/escrow"
import { logAudit } from "@/lib/audit"
import { announce } from "@/lib/announce"
import { incr } from "@/lib/analytics"

interface PageProps {
  params: { id: string }
}

export default function EscrowPage({ params }: PageProps) {
  const [escrow, setEscrow] = useState<Escrow | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const esc = getEscrowById(params.id)
      setEscrow(esc)
      setLoading(false)
    }
  }, [params.id])

  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleConditionChange = (
    key: keyof Escrow["conditions"],
    value: boolean
  ) => {
    if (!escrow) return

    const updated = setConditions(escrow.id, { [key]: value })
    if (updated) {
      setEscrow(updated)

      // Check if all conditions are met
      const c = updated.conditions
      if (
        c.borrowerConfirmedReceipt &&
        c.coolingOffComplete &&
        c.noDispute &&
        updated.status === "RELEASE_READY"
      ) {
        setStatusMessage("All conditions met! Ready to release funds.")
      }
    }
  }

  const handleReleaseFunds = () => {
    if (!escrow) return

    const updated = releaseFunds(escrow.id)
    if (updated) {
      setEscrow(updated)
      setStatusMessage("Funds released successfully! 🎉")
      
      // Log audit event
      logAudit("ESCROW_RELEASE", {
        escrowId: updated.id,
      })

      // Announce to screen readers
      announce("Escrow released in simulation.")

      // Track analytics
      incr("escrow_release")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-muted-foreground">Loading escrow...</p>
        )</div>
    )
  }

  if (!escrow) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h1 className="mb-2 text-2xl font-bold">Escrow Not Found</h1>
            <p className="mb-6 text-muted-foreground">
              The escrow you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href="/p2p">Back to P2P</Link>
            </Button>
          </div>
        )</div>
    )
  }

  const canRelease =
    escrow.status === "RELEASE_READY" || escrow.status === "RELEASED"
  const isReleased = escrow.status === "RELEASED"

  return (
    <div className="bg-muted/50 py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/p2p">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to P2P
            </Link>
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Escrow Management</h1>
              <StatusBadge status={escrow.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Escrow ID: <span className="font-mono">{escrow.id}</span>
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-950/20"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-200">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}

          {/* Funding Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Funding Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Target Amount
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatUZS(escrow.targetAmount)} UZS
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Funded Amount
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatUZS(escrow.fundedAmount)} UZS
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Release Conditions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Release Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="confirmed-receipt">
                      Borrower Confirms Receipt
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Borrower acknowledges receiving the loan amount
                    </p>
                  </div>
                  <Switch
                    id="confirmed-receipt"
                    checked={escrow.conditions.borrowerConfirmedReceipt}
                    onCheckedChange={(checked) =>
                      handleConditionChange("borrowerConfirmedReceipt", checked)
                    }
                    disabled={isReleased}
                    aria-label="Toggle borrower confirmed receipt"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cooling-off">
                      Cooling-Off Period Complete
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mandatory waiting period has passed
                    </p>
                  </div>
                  <Switch
                    id="cooling-off"
                    checked={escrow.conditions.coolingOffComplete}
                    onCheckedChange={(checked) =>
                      handleConditionChange("coolingOffComplete", checked)
                    }
                    disabled={isReleased}
                    aria-label="Toggle cooling-off period complete"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="no-dispute">No Dispute Raised</Label>
                    <p className="text-sm text-muted-foreground">
                      No disputes or fraud claims have been filed
                    </p>
                  </div>
                  <Switch
                    id="no-dispute"
                    checked={escrow.conditions.noDispute}
                    onCheckedChange={(checked) =>
                      handleConditionChange("noDispute", checked)
                    }
                    disabled={isReleased}
                    aria-label="Toggle no dispute raised"
                  />
                </div>
              </div>

              {escrow.status === "FUNDED" && !canRelease && (
                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20">
                  <p className="text-sm text-yellow-900 dark:text-yellow-200">
                    Complete all conditions above to enable fund release.
                  </p>
                </div>
              )}

              {canRelease && !isReleased && (
                <Button
                  onClick={handleReleaseFunds}
                  className="w-full"
                  size="lg"
                  aria-label="Release funds (simulate)"
                >
                  Release Funds (Simulate)
                </Button>
              )}

              {isReleased && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 text-green-900 dark:text-green-200">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    <span className="font-semibold">
                      Funds Released Successfully
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                    In production, this would trigger actual fund transfer to
                    lenders.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pledges */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lender Pledges ({escrow.pledges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <PledgeTable pledges={escrow.pledges} />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mb-6 flex gap-3">
            <Button asChild variant="default">
              <Link href={`/p2p/escrow/${escrow.id}/repay`}>
                Repay / Default Simulator
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/p2p/lend/statements">View Statements</Link>
            </Button>
          </div>

          {/* Regulatory Redlines */}
          <Card className="border-yellow-300 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-200">
                <AlertCircle className="h-5 w-5" />
                Regulatory Redlines (Demo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-2 text-sm text-yellow-900 dark:text-yellow-200">
                <li>
                  <strong>No custody of client funds</strong> — escrow is
                  simulated.
                </li>
                <li>
                  <strong>KYC/AML is not implemented here</strong> — would
                  require licensed flow.
                </li>
                <li>
                  <strong>No lending decisions are made by the app</strong> —
                  only comparisons.
                </li>
                <li>
                  <strong>APR shown is for comparison</strong> — not an offer.
                </li>
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                This is a demonstration only. Real P2P lending requires
                regulatory compliance, licensed custodians, and legal
                infrastructure.
              </p>
            </CardContent>
          </Card>
        </div>
      )</div>
  )
}
