"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs";
import { SectionCard } from "@/components/p2p/SectionCard";
import { MatchPlanTable } from "@/components/p2p/MatchPlanTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readIntent, hasEscrows } from "@/lib/p2p";
import { listEscrows, createEscrowForRequest, createBorrowRequest } from "@/lib/escrow";
import { buildGreedyPlan, buildProRataPlan } from "@/lib/matching";
import { commitFundingPlan } from "@/lib/escrow.apply";
import { listOffers } from "@/lib/lenderOffers";
import { readWallet } from "@/lib/lender";
import { FundingPlan } from "@/lib/matching.types";
import { writeAudit, AuditEvent } from "@/lib/audit";
import { incr } from "@/lib/analytics";
import RequireAuth from "@/components/auth/RequireAuth";

export default function BorrowPage() {
  const router = useRouter();
  const [intent, setIntent] = useState<ReturnType<typeof readIntent>>(null);
  const [hasActiveEscrows, setHasActiveEscrows] = useState(false);
  const [latestEscrowId, setLatestEscrowId] = useState<string | null>(null);
  const [plan, setPlan] = useState<FundingPlan | null>(null);
  const [activeOffers, setActiveOffers] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    setIntent(readIntent());
    setHasActiveEscrows(hasEscrows());

    const escrows = listEscrows();
    if (escrows.length > 0) {
      setLatestEscrowId(escrows[escrows.length - 1].id);
    }

    const offers = listOffers().filter((o) => o.status === "ACTIVE");
    setActiveOffers(offers.length);

    const wallet = readWallet();
    setWalletBalance(wallet?.balance ?? 0);
  }, []);

  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewEscrow = () => {
    if (latestEscrowId) {
      router.push(`/p2p/escrow/${latestEscrowId}`);
    }
  };

  const scoreToBucket = (score: number): "A" | "B" | "C" | "D" => {
    return score >= 720 ? "A" : score >= 620 ? "B" : score >= 520 ? "C" : "D";
  };

  const handlePreviewGreedy = () => {
    if (!intent) return;
    const bucket = scoreToBucket(intent.score);
    const matchInput = {
      amount: intent.amount,
      termDays: intent.termDays,
      borrowerBucket: bucket,
    };
    const greedyPlan = buildGreedyPlan(matchInput);
    setPlan(greedyPlan);
  };

  const handlePreviewProRata = () => {
    if (!intent) return;
    const bucket = scoreToBucket(intent.score);
    const matchInput = {
      amount: intent.amount,
      termDays: intent.termDays,
      borrowerBucket: bucket,
    };
    const proRataPlan = buildProRataPlan(matchInput);
    setPlan(proRataPlan);
  };

  const handleCommitPlan = () => {
    if (!intent || !plan || plan.filled <= 0) return;

    // Create borrow request
    const req = createBorrowRequest(intent.amount, intent.termDays, intent.score);

    // Create escrow
    const escrow = createEscrowForRequest(req);

    // Commit funding plan (place holds, update allocated, attach legs)
    commitFundingPlan(escrow.id, plan);

    // Audit & analytics
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "MATCH_COMMIT",
      payload: {
        escrowId: escrow.id,
        legs: plan.legs.length,
        filled: plan.filled,
      },
    };
    writeAudit([auditEvent]);
    incr("p2p_funded");

    // Navigate to escrow
    router.push(`/p2p/escrow/${escrow.id}`);
  };

  const handleFallbackSimulatedPool = () => {
    // This would use the old mock pledges flow
    // For now, just route to the old P2P page if it exists
    router.push("/offers");
  };

  return (
    // eslint-disable-next-line jsx-a11y/aria-role
    <RequireAuth role="user">
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <P2PBreadcrumbs trail="borrow" />

        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
            Borrow — Match & Allocate
          </h1>
          <p className="text-muted-foreground">
            Match your request to active lender offers using greedy or pro-rata
            strategies. Commit to create an escrow with real funding legs.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            <strong>Simulation only.</strong> No real funds or networking. For
            demo purposes.
          </AlertDescription>
        </Alert>

        {!intent && (
          <Alert className="mb-6" variant="default">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>No Request Found</AlertTitle>
            <AlertDescription>
              You need to apply for a loan and select a P2P offer first. Start by
              completing the application form.
            </AlertDescription>
          </Alert>
        )}

        {intent && (
          <>
            <SectionCard
                title="Current Request"
                subtitle="Your active P2P intent"
              >
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      {formatUZS(intent.amount)} UZS
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term:</span>
                    <span className="font-semibold">{intent.termDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-semibold">{intent.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bucket:</span>
                    <span className="font-semibold">
                      {scoreToBucket(intent.score)}
                    </span>
                  </div>
                </div>
                {hasActiveEscrows && latestEscrowId && (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleViewEscrow} className="flex-1">
                      <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                      View Escrow
                    </Button>
                  </div>
                )}
              </SectionCard>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Match from Lender Offers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Active offers: <strong>{activeOffers}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Wallet balance:{" "}
                      <strong>{formatUZS(walletBalance)} UZS</strong>
                    </span>
                  </div>

                  {activeOffers === 0 || walletBalance === 0 ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertTitle>No Matching Capacity</AlertTitle>
                      <AlertDescription>
                        {activeOffers === 0 &&
                          "There are no ACTIVE lender offers. "}
                        {walletBalance === 0 &&
                          "The lender wallet balance is 0. "}
                        <Link
                          href="/p2p/lend/offers"
                          className="underline font-semibold"
                        >
                          Create lender offers
                        </Link>{" "}
                        or{" "}
                        <Link
                          href="/p2p/wallet"
                          className="underline font-semibold"
                        >
                          top up the wallet
                        </Link>{" "}
                        to enable matching.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePreviewGreedy}
                          variant="default"
                          size="sm"
                        >
                          <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
                          Preview (Greedy)
                        </Button>
                        <Button
                          onClick={handlePreviewProRata}
                          variant="outline"
                          size="sm"
                        >
                          Preview (Pro-rata)
                        </Button>
                      </div>

                      {plan && (
                        <div className="space-y-4">
                          <MatchPlanTable plan={plan} />

                          {plan.shortfall > 0 && (
                            <Alert>
                              <Info className="h-4 w-4" aria-hidden="true" />
                              <AlertTitle>Partial Fill</AlertTitle>
                              <AlertDescription className="text-sm">
                                Your request can only be filled partially (
                                {formatUZS(plan.filled)} / {formatUZS(plan.requested)}{" "}
                                UZS). You can:
                                <ul className="list-disc pl-5 mt-2">
                                  <li>
                                    <Link
                                      href="/p2p/wallet"
                                      className="underline font-semibold"
                                    >
                                      Top up lender wallet
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href="/p2p/lend/offers#new"
                                      className="underline font-semibold"
                                    >
                                      Create more offers
                                    </Link>
                                  </li>
                                  <li>Proceed with partial amount</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          <Button
                            onClick={handleCommitPlan}
                            disabled={plan.filled <= 0}
                            className="w-full"
                          >
                            Commit Plan & Create Escrow
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-yellow-800 dark:text-yellow-200">
                    <Info className="h-5 w-5" aria-hidden="true" />
                    Fallback: Simulated Pool
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="mb-3">
                    If no lender offers are available or you prefer a simpler demo
                    flow, you can use the <strong>simulated pool</strong> with
                    synthetic pledges (for demo only).
                  </p>
                  <Button
                    onClick={handleFallbackSimulatedPool}
                    variant="outline"
                    size="sm"
                  >
                    Use Simulated Pool Instead
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!intent && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SectionCard
                title="Start a Request"
                subtitle="Apply for a loan to get started"
              >
                <p className="text-sm text-muted-foreground">
                  Complete the loan application form to see personalized offers
                  from both bank and P2P lenders. Your request will be evaluated
                  for eligibility.
                </p>
                <Button asChild className="w-full">
                  <Link href="/apply">
                    <ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />
                    Go to Application
                  </Link>
                </Button>
              </SectionCard>

              <SectionCard
                title="View Offers"
                subtitle="See your ranked loan offers"
              >
                <p className="text-sm text-muted-foreground">
                  After applying, review offers ranked by APR. Select a P2P offer
                  to initiate the matching and escrow process.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/offers">
                    <ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />
                    View Offers
                  </Link>
                </Button>
              </SectionCard>
            </div>
        )}

        <div className="mt-6 rounded-lg border bg-card p-4 text-sm">
          <h3 className="mb-2 font-semibold">How P2P Matching Works</h3>
          <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
            <li>Complete loan application with your details</li>
            <li>Review ranked offers (bank + P2P)</li>
            <li>Select a P2P offer to see matching options</li>
            <li>
              Preview funding plan (Greedy = cheapest first, Pro-rata =
              proportional)
            </li>
            <li>Commit plan to place wallet holds and create escrow</li>
            <li>Review escrow legs and release conditions</li>
            <li>Once conditions met, funds are released</li>
          </ol>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
