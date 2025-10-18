import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionCard } from "./SectionCard"

export function BorrowIntro() {
  return (
    <SectionCard
      title="Borrow from P2P Pool"
      subtitle="Get funded by multiple lenders with transparent terms"
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p>
            <strong>Apply once:</strong> Submit your loan request through our
            intake form
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p>
            <strong>Get matched:</strong> Multiple lenders pledge to fund your
            request
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p>
            <strong>Escrow protection:</strong> Funds held securely with clear
            release conditions
          </p>
        </div>
      </div>

      <Button asChild className="w-full">
        <Link href="/p2p/borrow">
          Start Borrowing
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </SectionCard>
  )
}

