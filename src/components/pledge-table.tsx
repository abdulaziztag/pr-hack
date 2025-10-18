import { LenderPledge } from "@/lib/types"

interface PledgeTableProps {
  pledges: LenderPledge[]
}

export function PledgeTable({ pledges }: PledgeTableProps) {
  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalAmount = pledges.reduce((sum, p) => sum + p.amount, 0)

  if (pledges.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No pledges yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b">
            <th className="pb-2 text-left font-semibold">Lender</th>
            <th className="pb-2 text-right font-semibold">Amount (UZS)</th>
            <th className="pb-2 text-right font-semibold">Daily Rate</th>
          </tr>
        </thead>
        <tbody>
          {pledges.map((pledge) => (
            <tr key={pledge.id} className="border-b last:border-0">
              <td className="py-2">{pledge.lenderName}</td>
              <td className="py-2 text-right font-mono">
                {formatUZS(pledge.amount)}
              </td>
              <td className="py-2 text-right font-mono">
                {(pledge.rateDailyPct * 100).toFixed(3)}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <td className="pt-2">Total</td>
            <td className="pt-2 text-right font-mono">
              {formatUZS(totalAmount)}
            </td>
            <td className="pt-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
