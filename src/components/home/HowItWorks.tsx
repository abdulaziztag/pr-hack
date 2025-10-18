import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Enter details",
    description: "Enter amount + term → quick KYC-lite. Takes less than 2 minutes.",
  },
  {
    number: 2,
    title: "Compare offers",
    description: "Compare offers by APR. See all costs in one transparent number.",
  },
  {
    number: 3,
    title: "Choose & simulate",
    description: "Choose rail; simulate escrow & repayment. Understand the full lifecycle.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/50 py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
          How It Works
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="h-full">
                <CardHeader>
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
                    aria-label={`Step ${step.number}`}
                  >
                    {step.number}
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>

              {/* Arrow between steps on desktop */}
              {index < steps.length - 1 && (
                <div
                  className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 md:block"
                  aria-hidden="true"
                >
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

