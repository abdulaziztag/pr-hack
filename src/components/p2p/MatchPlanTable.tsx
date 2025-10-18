import { FundingPlan } from "@/lib/matching.types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MatchPlanTableProps {
  plan: FundingPlan;
  showOfferLinks?: boolean;
}

export function MatchPlanTable({
  plan,
  showOfferLinks = true,
}: MatchPlanTableProps) {
  const formatUZS = (amount: number) => amount.toLocaleString("uz-UZ");

  return (
    <div className="space-y-4">
      {/* Strategy Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          Strategy: {plan.strategy}
        </Badge>
        <p className="text-sm text-muted-foreground">
          Term: {plan.termDays} days
        </p>
      </div>

      {/* Legs Table */}
      {plan.legs.length > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableCaption className="sr-only">
              Funding allocation breakdown
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Offer ID</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Max/Borrower</TableHead>
                <TableHead className="text-right">Allocated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.legs.map((leg, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm">
                    {showOfferLinks ? (
                      <Link
                        href="/p2p/lend/offers#manage"
                        className="text-primary hover:underline"
                      >
                        {leg.offerId.slice(0, 12)}...
                      </Link>
                    ) : (
                      <span>{leg.offerId.slice(0, 12)}...</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {(leg.dailyRatePct * 100).toFixed(3)}%/day
                    <span className="text-xs text-muted-foreground block">
                      ≈{(leg.dailyRatePct * 365 * 100).toFixed(1)}% APR
                    </span>
                  </TableCell>
                  <TableCell>{formatUZS(leg.maxPerBorrower)} UZS</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatUZS(leg.amount)} UZS
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No matching offers found.
        </p>
      )}

      {/* Summary */}
      <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Requested:</span>
          <span className="text-sm">{formatUZS(plan.requested)} UZS</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Filled:
          </span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            {formatUZS(plan.filled)} UZS
          </span>
        </div>
        {plan.shortfall > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Shortfall:
            </span>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {formatUZS(plan.shortfall)} UZS
            </span>
          </div>
        )}
        {plan.filled > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Blended Rate:</span>
              <span className="text-sm font-semibold">
                {plan.legs.length > 0
                  ? (
                      (plan.legs.reduce(
                        (s, l) => s + l.dailyRatePct * l.amount,
                        0
                      ) /
                        plan.filled) *
                      100
                    ).toFixed(3)
                  : "0.000"}
                %/day
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

