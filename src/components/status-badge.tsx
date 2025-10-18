import { Badge } from "@/components/ui/badge"
import { EscrowStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: EscrowStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<
    EscrowStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline"
      label: string
    }
  > = {
    PENDING: { variant: "secondary", label: "Pending" },
    FUNDED: { variant: "default", label: "Funded" },
    RELEASE_READY: { variant: "default", label: "Release Ready" },
    RELEASED: { variant: "outline", label: "Released" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    EXPIRED: { variant: "destructive", label: "Expired" },
  }

  const config = variants[status]

  return (
    <Badge variant={config.variant} aria-label={`Status: ${config.label}`}>
      {config.label}
    </Badge>
  )
}
