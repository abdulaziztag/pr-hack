"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Download, FileText } from "lucide-react";
import { readWallet, TxType } from "@/lib/lender";
import { TxRow } from "@/components/p2p/TxRow";
import { toCSV } from "@/lib/csv";
import Link from "next/link";
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs";

export default function StatementsPage() {
  const [balance, setBalance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [txs, setTxs] = useState<Array<{ id: string; ts: number; type: TxType; amount: number; note?: string }>>([]);
  const [txCounts, setTxCounts] = useState<Record<TxType, number>>({
    TOP_UP: 0,
    WITHDRAW: 0,
    INTEREST: 0,
    REFUND: 0,
    ADJUST: 0,
    HOLD: 0,
    RELEASE: 0,
    LOSS: 0,
  });

  useEffect(() => {
    const wallet = readWallet();
    if (wallet) {
      setBalance(wallet.balance);
      setLastUpdated(wallet.updatedAt);
      setTxs(wallet.txs);

      // Count transactions by type
      const counts: Record<TxType, number> = {
        TOP_UP: 0,
        WITHDRAW: 0,
        INTEREST: 0,
        REFUND: 0,
        ADJUST: 0,
        HOLD: 0,
        RELEASE: 0,
        LOSS: 0,
      };
      wallet.txs.forEach((tx) => {
        counts[tx.type] = (counts[tx.type] || 0) + 1;
      });
      setTxCounts(counts);
    }
  }, []);

  const formatUZS = (amount: number) => amount.toLocaleString("uz-UZ");

  const handleExportCSV = () => {
    if (txs.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const rows = txs.map((tx) => {
      const sign =
        tx.type === "TOP_UP" ||
        tx.type === "INTEREST" ||
        tx.type === "ADJUST" ||
        tx.type === "RELEASE"
          ? "+"
          : "−";
      return {
        time: new Date(tx.ts).toISOString(),
        type: tx.type,
        amount: `${sign}${tx.amount}`,
        note: tx.note || "",
      };
    });

    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `statements_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-muted/50 py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <P2PBreadcrumbs trail="lend" />

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
                Statements (Sandbox)
              </h1>
              <p className="text-muted-foreground">
                View transaction history and export to CSV
              </p>
            </div>
            <Badge variant="outline">Simulation Only</Badge>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Simulation only.</strong> All transactions are local and not
              backed by real funds.
            </AlertDescription>
          </Alert>

          {/* Wallet Snapshot */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Wallet Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 text-sm text-muted-foreground">
                  Current Balance
                </div>
                <div className="text-3xl font-bold">
                  {formatUZS(balance)} UZS
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Last updated:{" "}
                  {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Top-ups</p>
                  <p className="text-lg font-semibold">{txCounts.TOP_UP}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Holds</p>
                  <p className="text-lg font-semibold">{txCounts.HOLD}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Releases</p>
                  <p className="text-lg font-semibold">{txCounts.RELEASE}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Interest</p>
                  <p className="text-lg font-semibold">{txCounts.INTEREST}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Withdrawals</p>
                  <p className="text-lg font-semibold">{txCounts.WITHDRAW}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Refunds</p>
                  <p className="text-lg font-semibold">{txCounts.REFUND}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Losses</p>
                  <p className="text-lg font-semibold text-red-600">
                    {txCounts.LOSS}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Adjustments</p>
                  <p className="text-lg font-semibold">{txCounts.ADJUST}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                disabled={txs.length === 0}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {txs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption className="sr-only">
                      Wallet transaction history
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
                      {txs.map((tx) => (
                        <TxRow key={tx.id} {...tx} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText
                    className="mb-3 h-12 w-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-muted-foreground">
                    No transactions yet. Top up your wallet to see history.
                  </p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/p2p/wallet">Go to Wallet</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/p2p/lend">Back to Lend Overview</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/p2p/wallet">View Wallet</Link>
            </Button>
          </div>
        </div>
      )</div>
  );
}

