"use client";

import { useState, useEffect } from "react";
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs";
import { LenderGuard } from "@/components/p2p/LenderGuard";
import { WalletSummary } from "@/components/p2p/WalletSummary";
import { TxRow } from "@/components/p2p/TxRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, TrendingUp } from "lucide-react";
import { readWallet, postTx, Wallet } from "@/lib/lender";
import { writeAudit, AuditEvent } from "@/lib/audit";
import { incr } from "@/lib/analytics";

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setWallet(readWallet());
  }, []);

  const refreshWallet = () => {
    setWallet(readWallet());
  };

  const handleTopUp = () => {
    setError("");
    const amount = parseInt(topUpAmount, 10);
    if (!amount || amount < 50_000) {
      setError("Minimum top-up is 50,000 UZS");
      return;
    }
    postTx("TOP_UP", amount, "Seed top-up");
    incr("p2p_posts");
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "WALLET_TX",
      payload: { type: "TOP_UP", amount },
    };
    writeAudit([auditEvent]);
    setTopUpAmount("");
    refreshWallet();
  };

  const handleWithdraw = () => {
    setError("");
    const amount = parseInt(withdrawAmount, 10);
    if (!amount || amount <= 0) {
      setError("Invalid withdrawal amount");
      return;
    }
    if (!wallet || amount > wallet.balance) {
      setError("Insufficient balance");
      return;
    }
    postTx("WITHDRAW", amount, "Simulated withdrawal");
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "WALLET_TX",
      payload: { type: "WITHDRAW", amount },
    };
    writeAudit([auditEvent]);
    setWithdrawAmount("");
    refreshWallet();
  };

  const handleInterest = () => {
    if (!wallet || wallet.balance === 0) return;
    const interest = Math.floor(wallet.balance * 0.01);
    if (interest === 0) return;
    postTx("INTEREST", interest, "Simulated 1% interest");
    incr("p2p_funded");
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "WALLET_TX",
      payload: { type: "INTEREST", amount: interest },
    };
    writeAudit([auditEvent]);
    refreshWallet();
  };

  return (
    <div className="bg-muted/50 py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <P2PBreadcrumbs />

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
                Your Wallet (Sandbox)
              </h1>
              <p className="text-muted-foreground">
                Manage your lending funds and transaction history
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              Simulation Only
            </Badge>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Simulation only.</strong> No real funds or networking.
              For demo purposes.
            </AlertDescription>
          </Alert>

          <LenderGuard>
            {wallet && (
              <>
                <WalletSummary
                  balance={wallet.balance}
                  updatedAt={wallet.updatedAt}
                />

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {/* Top Up */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Up (Seed)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="topUpAmount">Amount (UZS)</Label>
                        <Input
                          id="topUpAmount"
                          type="number"
                          min="50000"
                          step="10000"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          placeholder="50,000"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Minimum: 50,000 UZS
                        </p>
                      </div>
                      <Button onClick={handleTopUp} className="w-full">
                        Add Funds
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Withdraw */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Withdraw (Simulate)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="withdrawAmount">Amount (UZS)</Label>
                        <Input
                          id="withdrawAmount"
                          type="number"
                          min="1"
                          step="10000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="10,000"
                          max={wallet.balance}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Available: {wallet.balance.toLocaleString("uz-UZ")}{" "}
                          UZS
                        </p>
                      </div>
                      <Button
                        onClick={handleWithdraw}
                        variant="outline"
                        className="w-full"
                        disabled={wallet.balance === 0}
                      >
                        Withdraw
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Interest */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" aria-hidden="true" />
                        Interest (Simulate)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Add 1% interest to your current balance for testing
                        purposes.
                      </p>
                      <Button
                        onClick={handleInterest}
                        variant="secondary"
                        className="w-full"
                        disabled={wallet.balance === 0}
                      >
                        Add 1% Interest
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Transaction History */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wallet.txs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No transactions yet. Start by topping up your wallet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableCaption className="sr-only">
                            Transaction history for your wallet
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Note</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {wallet.txs.map((tx) => (
                              <TxRow
                                key={tx.id}
                                ts={tx.ts}
                                type={tx.type}
                                amount={tx.amount}
                                note={tx.note}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Alert className="mt-6" variant="default">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>
                    <strong>Demo wallet only.</strong> Funds are not real. This
                    balance only gates simulated lending.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </LenderGuard>
      </div>
    </div>
  );
}

