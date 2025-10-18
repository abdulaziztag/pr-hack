"use client";

import { useState } from "react";
import { LenderOffer } from "@/lib/lenderOffers";
import { validateLenderOffer, OfferIssue } from "@/lib/offerValidateLender";
import { walletAvailableForNewOffer } from "@/lib/capacity";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import Link from "next/link";

interface OfferFormProps {
  onSubmit: (offer: Omit<LenderOffer, "id" | "createdAt" | "updatedAt" | "allocated" | "status">) => void;
  onCancel?: () => void;
  initialValues?: Partial<LenderOffer>;
}

export function OfferForm({ onSubmit, onCancel, initialValues }: OfferFormProps) {
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || "");
  const [minTermDays, setMinTermDays] = useState(initialValues?.minTermDays?.toString() || "");
  const [maxTermDays, setMaxTermDays] = useState(initialValues?.maxTermDays?.toString() || "");
  const [dailyRatePctInput, setDailyRatePctInput] = useState(
    initialValues?.targetDailyRatePct ? (initialValues.targetDailyRatePct * 100).toFixed(2) : ""
  );
  const [maxPerBorrower, setMaxPerBorrower] = useState(initialValues?.maxPerBorrower?.toString() || "");
  const [allowBuckets, setAllowBuckets] = useState<("A" | "B" | "C" | "D")[]>(
    initialValues?.allowBuckets || []
  );
  const [notes, setNotes] = useState(initialValues?.notes || "");
  const [issues, setIssues] = useState<OfferIssue[]>([]);

  const availableCapacity = walletAvailableForNewOffer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetDailyRatePct = parseFloat(dailyRatePctInput) / 100;
    const offer: Omit<LenderOffer, "id" | "createdAt" | "updatedAt" | "allocated" | "status"> = {
      amount: parseInt(amount, 10) || 0,
      minTermDays: parseInt(minTermDays, 10) || 0,
      maxTermDays: parseInt(maxTermDays, 10) || 0,
      targetDailyRatePct,
      maxPerBorrower: parseInt(maxPerBorrower, 10) || 0,
      allowBuckets,
      notes: notes.trim() || undefined,
    };

    const validationIssues = validateLenderOffer({
      ...offer,
      id: "",
      createdAt: 0,
      updatedAt: 0,
      allocated: 0,
      status: "ACTIVE",
    });

    // Check wallet capacity
    if (offer.amount > availableCapacity) {
      validationIssues.push({
        path: "amount",
        message: `Amount exceeds available wallet capacity (${availableCapacity.toLocaleString("uz-UZ")} UZS).`,
        severity: "error",
      });
    }

    setIssues(validationIssues);

    const hasErrors = validationIssues.some((i) => i.severity === "error");
    if (!hasErrors) {
      onSubmit(offer);
    }
  };

  const toggleBucket = (bucket: "A" | "B" | "C" | "D") => {
    setAllowBuckets((prev) =>
      prev.includes(bucket) ? prev.filter((b) => b !== bucket) : [...prev, bucket]
    );
  };

  const estimatedAPR = parseFloat(dailyRatePctInput) * 365;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div>
        <Label htmlFor="amount">
          Amount (UZS) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          min="50000"
          step="10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100,000"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Available capacity: {availableCapacity.toLocaleString("uz-UZ")} UZS
        </p>
      </div>

      {/* Term Range */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="minTermDays">
            Min Term (days) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="minTermDays"
            type="number"
            min="5"
            max="180"
            value={minTermDays}
            onChange={(e) => setMinTermDays(e.target.value)}
            placeholder="10"
            required
          />
        </div>
        <div>
          <Label htmlFor="maxTermDays">
            Max Term (days) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="maxTermDays"
            type="number"
            min="5"
            max="180"
            value={maxTermDays}
            onChange={(e) => setMaxTermDays(e.target.value)}
            placeholder="30"
            required
          />
        </div>
      </div>

      {/* Daily Rate */}
      <div>
        <Label htmlFor="dailyRate">
          Target Daily Rate (%) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="dailyRate"
          type="number"
          min="0.01"
          max="1"
          step="0.01"
          value={dailyRatePctInput}
          onChange={(e) => setDailyRatePctInput(e.target.value)}
          placeholder="0.1"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {dailyRatePctInput && !isNaN(parseFloat(dailyRatePctInput)) && (
            <>Estimated APR (simple): ≈ {estimatedAPR.toFixed(1)}%</>
          )}
        </p>
      </div>

      {/* Max Per Borrower */}
      <div>
        <Label htmlFor="maxPerBorrower">
          Max Per Borrower (UZS) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="maxPerBorrower"
          type="number"
          min="1"
          value={maxPerBorrower}
          onChange={(e) => setMaxPerBorrower(e.target.value)}
          placeholder="50,000"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Maximum amount to lend to a single borrower
        </p>
      </div>

      {/* Allow Buckets */}
      <div>
        <Label>
          Allowed Borrower Buckets <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 space-y-2">
          {(["A", "B", "C", "D"] as const).map((bucket) => (
            <div key={bucket} className="flex items-center gap-2">
              <Checkbox
                id={`bucket-${bucket}`}
                checked={allowBuckets.includes(bucket)}
                onCheckedChange={() => toggleBucket(bucket)}
              />
              <Label htmlFor={`bucket-${bucket}`} className="cursor-pointer font-normal">
                Bucket {bucket}
                {bucket === "A" && " (≥720, lowest risk)"}
                {bucket === "B" && " (620–719, moderate risk)"}
                {bucket === "C" && " (520–619, higher risk)"}
                {bucket === "D" && " (<520, highest risk)"}
              </Label>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Your offers only consider borrowers whose bucket is in this list.
        </p>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this offer..."
          rows={3}
        />
      </div>

      {/* Capacity Alert */}
      {availableCapacity === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            <strong>No wallet capacity available.</strong> Please{" "}
            <Link href="/p2p/wallet" className="underline font-semibold">
              top up your wallet
            </Link>{" "}
            to create new offers.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Issues */}
      {issues.length > 0 && (
        <Alert variant={issues.some((i) => i.severity === "error") ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {issues.map((issue, i) => (
                <li key={i}>
                  <strong>{issue.path}:</strong> {issue.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Hint */}
      <Alert>
        <Info className="h-4 w-4" aria-hidden="true" />
        <AlertDescription className="text-sm">
          <strong>Tip:</strong> Your offer will be matched with borrowers whose term and risk bucket fit within your
          parameters. Higher daily rates may attract more volume but increase your risk exposure.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={availableCapacity === 0}>
          Create Offer
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

