"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Wallet, FileText, BarChart3, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs"
import { SectionCard } from "@/components/p2p/SectionCard"
import { WalletSummary } from "@/components/p2p/WalletSummary"
import { Badge } from "@/components/ui/badge"
import { isLenderReady } from "@/lib/gates"
import { readProfile, readWallet } from "@/lib/lender"
import RequireAuth from "@/components/auth/RequireAuth"

export default function LendPage() {
  const [ready, setReady] = useState(false)
  const [balance, setBalance] = useState(0)
  const [profileName, setProfileName] = useState("")

  useEffect(() => {
    setReady(isLenderReady())
    const profile = readProfile()
    if (profile) {
      setProfileName(profile.fullName)
    }
    const wallet = readWallet()
    if (wallet) {
      setBalance(wallet.balance)
    }
  }, [])

  return (
    // eslint-disable-next-line jsx-a11y/aria-role
    <RequireAuth role="lender">
    <div className="bg-muted/50 py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <P2PBreadcrumbs trail="lend" />

          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
              Lend — Overview
            </h1>
            <p className="text-muted-foreground">
              Fund borrower requests and track your lending portfolio
            </p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Simulation only.</strong> No real funds or networking. For
              demo purposes.
            </AlertDescription>
          </Alert>

          <Alert className="mb-6" variant="default">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Regulatory Notice</AlertTitle>
            <AlertDescription className="text-sm">
              Lending as an individual is simulated. In production this would
              require licensing, KYC/AML compliance, and appropriate disclosures.
            </AlertDescription>
          </Alert>

          {!ready ? (
            <div className="mb-6 grid gap-4">
              <SectionCard
                title="Get Started"
                subtitle="Complete onboarding to begin lending"
              >
                <p className="text-sm text-muted-foreground">
                  Lender onboarding includes identity verification, funding
                  source setup, and risk acknowledgment. This is a simulation only.
                </p>
                <Button asChild variant="default" className="w-full">
                  <Link href="/p2p/lend/onboarding">
                    Start Onboarding
                  </Link>
                </Button>
              </SectionCard>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                <p className="text-sm">
                  <strong>Onboarded as:</strong> {profileName}
                </p>
                <Badge variant="outline" className="ml-auto">
                  Ready to Lend
                </Badge>
              </div>

              <div className="mb-6">
                <WalletSummary
                  balance={balance}
                  actions={
                    <>
                      <Button asChild variant="default">
                        <Link href="/p2p/wallet">
                          <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                          View Wallet
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/p2p/lend/offers#new">
                          Create Funding Offer
                        </Link>
                      </Button>
                    </>
                  }
                />
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <SectionCard title="Quick Actions">
                  <div className="space-y-2">
                    <Button asChild variant="secondary" className="w-full">
                      <Link href="/p2p/lend/offers#new">Create Funding Offer</Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full">
                      <Link href="/p2p/lend/offers#manage">Manage Offers</Link>
                    </Button>
                  </div>
                </SectionCard>
                <SectionCard title="Next Steps">
                  <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                    <li>Top up your wallet with seed funds to start lending</li>
                    <li>Browse active borrow requests (coming soon)</li>
                    <li>Create funding offers with custom rates and terms</li>
                    <li>Track your pledges and active loans</li>
                  </ul>
                </SectionCard>
              </div>
            </>
          )}

          <div className="mt-6 rounded-lg border bg-card p-4">
            <h3 className="mb-3 font-semibold">Upcoming Features</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <FileText className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Funding Offers</p>
                  <p className="text-xs text-muted-foreground">
                    Browse active borrow requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Wallet className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Wallet Management</p>
                  <p className="text-xs text-muted-foreground">
                    Deposits, withdrawals, balance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <BarChart3 className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Statements</p>
                  <p className="text-xs text-muted-foreground">
                    Returns, repayments, history
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="mt-6" variant="default">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Compliance Note</AlertTitle>
            <AlertDescription className="text-sm">
              <strong>Simulation environment.</strong> All lending actions are simulated.
              In production, lending would require:
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                <li>KYC/AML verification and ongoing monitoring</li>
                <li>Source of funds documentation</li>
                <li>Risk profiling and suitability assessment</li>
                <li>Regulatory disclosures and complaint procedures</li>
                <li>Tax reporting and withholding for residents</li>
              </ul>
            </AlertDescription>
          </Alert>      </div>
    </div>
    </RequireAuth>
  )
}

