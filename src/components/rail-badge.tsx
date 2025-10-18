import { Badge } from "@/components/ui/badge"
import { Rail } from "@/lib/types"

interface RailBadgeProps {
  rail: Rail
}

export function RailBadge({ rail }: RailBadgeProps) {
  return (
    <Badge variant={rail === "BANK" ? "default" : "secondary"}>{rail}</Badge>
  )
}
