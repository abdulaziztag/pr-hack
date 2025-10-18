import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionCard } from "./SectionCard"

export function LendIntro() {
  return (
    <SectionCard
      title="Lend to Borrowers"
      subtitle="Fund loan requests and earn returns (simulated)"
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p>
            <strong>Browse requests:</strong> View borrower profiles with
            verified risk scores
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p>
            <strong>Diversify:</strong> Pledge small amounts across multiple
            borrowers
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <p>
            <strong>Track performance:</strong> Monitor your wallet and
            repayment status
          </p>
        </div>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/p2p/lend">
          Explore Lending
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </SectionCard>
  )
}

