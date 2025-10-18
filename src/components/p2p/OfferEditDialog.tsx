"use client";

import { useState, useEffect } from "react";
import { LenderOffer } from "@/lib/lenderOffers";
import { validateLenderOffer, OfferIssue } from "@/lib/offerValidateLender";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface OfferEditDialogProps {
  offer: LenderOffer | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<LenderOffer>) => void;
}

export function OfferEditDialog({ offer, open, onClose, onSave }: OfferEditDialogProps) {
  const [amount, setAmount] = useState("");
  const [dailyRatePctInput, setDailyRatePctInput] = useState("");
  const [maxPerBorrower, setMaxPerBorrower] = useState("");
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState<OfferIssue[]>([]);

  useEffect(() => {
    if (offer) {
      setAmount(offer.amount.toString());
      setDailyRatePctInput((offer.targetDailyRatePct * 100).toFixed(2));
      setMaxPerBorrower(offer.maxPerBorrower.toString());
      setNotes(offer.notes || "");
      setIssues([]);
    }
  }, [offer]);

  const handleSave = () => {
    if (!offer) return;

    const targetDailyRatePct = parseFloat(dailyRatePctInput) / 100;
    const updates: Partial<LenderOffer> = {
      amount: parseInt(amount, 10) || 0,
      targetDailyRatePct,
      maxPerBorrower: parseInt(maxPerBorrower, 10) || 0,
      notes: notes.trim() || undefined,
    };

    const testOffer: LenderOffer = { ...offer, ...updates };
    const validationIssues = validateLenderOffer(testOffer);

    setIssues(validationIssues);

    const hasErrors = validationIssues.some((i) => i.severity === "error");
    if (!hasErrors) {
      onSave(offer.id, updates);
      onClose();
    }
  };

  if (!offer) return null;

  const estimatedAPR = parseFloat(dailyRatePctInput) * 365;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Offer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="edit-amount">
              Amount (UZS) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-amount"
              type="number"
              min="50000"
              step="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Daily Rate */}
          <div>
            <Label htmlFor="edit-dailyRate">
              Target Daily Rate (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-dailyRate"
              type="number"
              min="0.01"
              max="1"
              step="0.01"
              value={dailyRatePctInput}
              onChange={(e) => setDailyRatePctInput(e.target.value)}
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
            <Label htmlFor="edit-maxPerBorrower">
              Max Per Borrower (UZS) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-maxPerBorrower"
              type="number"
              min="1"
              value={maxPerBorrower}
              onChange={(e) => setMaxPerBorrower(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

