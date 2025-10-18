import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    title: "True APR",
    description:
      "Normalizes every fee into one comparable number. See the real cost of borrowing, not just the headline rate.",
  },
  {
    title: "Rail-neutral",
    description:
      "Bank vs P2P ranked by cost, not marketing. We show you the best deal regardless of the lending source.",
  },
  {
    title: "Explain fees",
    description:
      "Clause → plain language with citations. Understand exactly what you're paying for with source references.",
  },
  {
    title: "Demo-safe",
    description:
      "Local only, no real funds. Explore the platform safely with simulated data stored in your browser.",
  },
]

export function FeatureCards() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
          Why FairLend?
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

