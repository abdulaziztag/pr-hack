import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 sm:py-32">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline">Simulation only</Badge>
            <Badge variant="secondary">WCAG 2.2 AA</Badge>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            FairLend — honest micro-credit, rail-neutral
          </h1>

          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            See true APR and total repayment across banks and P2P in one screen.
            No hidden fees, no surprises—just transparent lending comparison.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/apply">
                Start Application
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="/p2p">Explore P2P</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

