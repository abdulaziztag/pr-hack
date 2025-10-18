import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="px-6 py-12 text-center sm:px-12">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to compare the real cost?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start your application or explore P2P lending options
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
                <Link href="/p2p">Go to P2P</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

