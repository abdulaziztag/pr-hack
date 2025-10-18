"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info, ArrowLeft, DollarSign, Clock, TrendingUp } from "lucide-react";
import { getEscrow, listEscrows } from "@/lib/escrow";
import { Escrow } from "@/lib/types";
import { snapshot } from "@/lib/accrual";
import { settleOnTime, settleLate, markDefault } from "@/lib/repayments";
import { incr } from "@/lib/analytics";
import Link from "next/link";

export default function RepayPage() {
  const params = useParams();
  const escrowId = params?.id as string;

  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [lateDays, setLateDays] = useState("5");
  const [recoveryPct, setRecoveryPct] = useState("40");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const e = getEscrow(escrowId);
    setEscrow(e);
  }, [escrowId]);

  const formatUZS = (amount: number) => amount.toLocaleString("uz-UZ");

  const handleSettleOnTime = () => {
    if (!escrow) return;
    setLoading(true);
    setMessage("");

    try {
      settleOnTime(escrow);
      incr("escrow_release");

      // Update storage
      const allEscrows = listEscrows();
      const index = allEscrows.findIndex((e) => e.id === escrow.id);
      if (index >= 0) {
        allEscrows[index] = escrow;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "fairlend.p2p.escrows",
            JSON.stringify(allEscrows)
          );
        }
      }

      setMessage("✅ Settled on-time! Wallets and offers updated (Simulation only).");
      setEscrow({ ...escrow });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("❌ An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSettleLate = () => {
    if (!escrow) return;
    setLoading(true);
    setMessage("");

    try {
      const extra = parseInt(lateDays, 10) || 0;
      settleLate(escrow, extra);
      incr("escrow_release");

      // Update storage
      const allEscrows = listEscrows();
      const index = allEscrows.findIndex((e) => e.id === escrow.id);
      if (index >= 0) {
        allEscrows[index] = escrow;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "fairlend.p2p.escrows",
            JSON.stringify(allEscrows)
          );
        }
      }

      setMessage(
        `✅ Settled late (+${extra} days)! Wallets and offers updated (Simulation only).`
      );
      setEscrow({ ...escrow });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("❌ An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDefault = () => {
    if (!escrow) return;
    setLoading(true);
    setMessage("");

    try {
      const recovery = parseFloat(recoveryPct) / 100 || 0;
      markDefault(escrow, recovery);
      incr("offers_views");

      // Update storage
      const allEscrows = listEscrows();
      const index = allEscrows.findIndex((e) => e.id === escrow.id);
      if (index >= 0) {
        allEscrows[index] = escrow;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "fairlend.p2p.escrows",
            JSON.stringify(allEscrows)
          );
        }
      }

      setMessage(
        `⚠️  Marked as DEFAULT (${Math.round(recovery * 100)}% recovery). Wallets and offers updated (Simulation only).`
      );
      setEscrow({ ...escrow });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("❌ An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!escrow) {
    return (
      <div className="bg-muted/50 py-12">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Escrow not found</AlertTitle>
              <AlertDescription>
                The escrow with ID {escrowId} does not exist.
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/p2p">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back to P2P
              </Link>
            </Button>
          </div>
        )</div>
    );
  }

  const s = snapshot(escrow);
  const isRepaidOrDefaulted =
    escrow.repayStatus === "REPAID" || escrow.repayStatus === "DEFAULTED";

  return (
    <div className="bg-muted/50 py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Repayment Simulator
              </h1>
              <p className="text-muted-foreground">
                Simulate on-time, late, or default scenarios for escrow{" "}
                <span className="font-mono text-sm">{escrow.id.slice(0, 12)}...</span>
              </p>
            </div>
            <Badge variant={isRepaidOrDefaulted ? "outline" : "default"}>
              {escrow.repayStatus || "ACTIVE"}
            </Badge>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Simulation only.</strong> No real funds move. This updates
              local wallet and offers only.
            </AlertDescription>
          </Alert>

          {isRepaidOrDefaulted && (
            <Alert className="mb-6" variant="default">
              <Info className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Loan Complete</AlertTitle>
              <AlertDescription>
                This loan has already been settled or defaulted. No further actions
                are needed.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Principal Outstanding
                    </p>
                    <p className="text-lg font-semibold">
                      {formatUZS(s.principal)} UZS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Days Elapsed</p>
                    <p className="text-lg font-semibold">{s.sinceFundingDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Accrued Interest</p>
                    <p className="text-lg font-semibold">
                      {formatUZS(s.accrued)} UZS
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Blended Daily Rate:</span>
                <span className="text-sm font-semibold">
                  {(s.dailyPct * 100).toFixed(3)}%/day
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary">
                  Total Due Today:
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatUZS(s.totalDueToday)} UZS
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          {!isRepaidOrDefaulted && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Settle On-Time */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Settle On-Time</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Repay principal + accrued interest, release holds, and credit
                    interest to wallet.
                  </p>
                  <Button
                    onClick={handleSettleOnTime}
                    disabled={loading}
                    className="w-full"
                  >
                    Settle On-Time ({formatUZS(s.totalDueToday)} UZS)
                  </Button>
                </div>

                {/* Settle Late */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Settle Late</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Add extra days of interest penalty before repaying.
                  </p>
                  <div className="mb-3 grid gap-2">
                    <Label htmlFor="lateDays">Extra Days Late</Label>
                    <Input
                      id="lateDays"
                      type="number"
                      min="1"
                      value={lateDays}
                      onChange={(e) => setLateDays(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <Button
                    onClick={handleSettleLate}
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    Settle Late (+{lateDays} days)
                  </Button>
                </div>

                {/* Mark Default */}
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                  <h3 className="mb-2 font-semibold text-red-800 dark:text-red-200">
                    Mark Default
                  </h3>
                  <p className="mb-3 text-sm text-red-700 dark:text-red-300">
                    Simulate a default with partial recovery. This will write down
                    the loss and free offer capacity.
                  </p>
                  <div className="mb-3 grid gap-2">
                    <Label htmlFor="recoveryPct">Recovery % (0-100)</Label>
                    <Input
                      id="recoveryPct"
                      type="number"
                      min="0"
                      max="100"
                      value={recoveryPct}
                      onChange={(e) => setRecoveryPct(e.target.value)}
                      placeholder="40"
                    />
                  </div>
                  <Button
                    onClick={handleMarkDefault}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    Mark Default ({recoveryPct}% recovery)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          {message && (
            <Alert
              className="mb-6"
              variant={message.startsWith("✅") ? "default" : "destructive"}
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/p2p/escrow/${escrow.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                View Escrow
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/p2p/lend/statements">View Statements</Link>
            </Button>
          </div>
        </div>
      )</div>
  );
}

