import React from "react";
import { Badge } from "@/components/ui/badge";
import { TxType } from "@/lib/lender";

interface TxRowProps {
  ts: number;
  type: TxType;
  amount: number;
  note?: string;
}

const TX_COLORS: Record<TxType, string> = {
  TOP_UP: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
  INTEREST: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
  REFUND: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
  WITHDRAW: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
  ADJUST: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200",
  HOLD: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
  RELEASE:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
  LOSS: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
};

export function TxRow({ ts, type, amount, note }: TxRowProps) {
  const formatTime = (t: number) => {
    return new Date(t).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amt: number, txType: TxType) => {
    const sign =
      txType === "TOP_UP" ||
      txType === "INTEREST" ||
      txType === "ADJUST" ||
      txType === "RELEASE"
        ? "+"
        : "−";
    return `${sign}${amt.toLocaleString("uz-UZ")} UZS`;
  };

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4 text-sm">{formatTime(ts)}</td>
      <td className="py-3 px-4">
        <Badge variant="outline" className={TX_COLORS[type]}>
          {type.replace("_", " ")}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm font-semibold">
        {formatAmount(amount, type)}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {note || "—"}
      </td>
    </tr>
  );
}

