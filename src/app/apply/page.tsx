import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { IntakeForm } from "@/components/intake-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Apply for Loan - Fair Lend",
  description: "Apply for a loan and get personalized offers",
}

export default function ApplyPage() {
  return (
    <div className="bg-muted/50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">Apply for a Loan</h1>
            <p className="mt-2 text-muted-foreground">
              Get rail-agnostic offers ranked by true APR
            </p>
          </div>

          <IntakeForm />
        </div>
    </div>
  )
}
