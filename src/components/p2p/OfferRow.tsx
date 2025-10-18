import { LenderOffer, OfferStatus, availableCapacity } from "@/lib/lenderOffers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pause, Play, X, Pencil } from "lucide-react";

interface OfferRowProps {
  offer: LenderOffer;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onEdit: (id: string) => void;
}

const STATUS_COLORS: Record<OfferStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
  PAUSED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
  FULLY_ALLOCATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
};

export function OfferRow({ offer, onPause, onResume, onCancel, onEdit }: OfferRowProps) {
  const formatUZS = (amount: number) => amount.toLocaleString("uz-UZ");
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const capacity = availableCapacity(offer);
  const aprEstimate = (offer.targetDailyRatePct * 365 * 100).toFixed(1);

  const canEdit = offer.status !== "CANCELLED";
  const canPause = offer.status === "ACTIVE";
  const canResume = offer.status === "PAUSED";
  const canCancel = offer.status !== "CANCELLED";

  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-3 px-4">
        <Badge variant="outline" className={STATUS_COLORS[offer.status]}>
          {offer.status}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm font-semibold">{formatUZS(offer.amount)} UZS</td>
      <td className="py-3 px-4 text-sm">{formatUZS(offer.allocated)} UZS</td>
      <td className="py-3 px-4 text-sm">
        {capacity > 0 ? (
          <span className="text-green-600 dark:text-green-400">{formatUZS(capacity)} UZS</span>
        ) : (
          <span className="text-red-600 dark:text-red-400">0 UZS</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm">
        {offer.minTermDays}–{offer.maxTermDays} days
      </td>
      <td className="py-3 px-4 text-sm">
        {(offer.targetDailyRatePct * 100).toFixed(2)}%/day
        <span className="text-xs text-muted-foreground block">≈{aprEstimate}% APR</span>
      </td>
      <td className="py-3 px-4 text-sm">{formatUZS(offer.maxPerBorrower)} UZS</td>
      <td className="py-3 px-4 text-sm">{offer.allowBuckets.join(", ")}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(offer.updatedAt)}</td>
      <td className="py-3 px-4">
        <div className="flex gap-1">
          {canPause && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPause(offer.id)}
              title="Pause offer"
            >
              <Pause className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Pause</span>
            </Button>
          )}
          {canResume && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResume(offer.id)}
              title="Resume offer"
            >
              <Play className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Resume</span>
            </Button>
          )}
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(offer.id)}
              title="Edit offer"
            >
              <Pencil className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(offer.id)}
              title="Cancel offer"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Cancel</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

