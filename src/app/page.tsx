import { Hero } from "@/components/home/Hero"
import { FeatureCards } from "@/components/home/FeatureCards"
import { HowItWorks } from "@/components/home/HowItWorks"
import { AprDemo } from "@/components/home/AprDemo"
import { TrustLogos } from "@/components/home/TrustLogos"
import { CTA } from "@/components/home/CTA"
import { FAQ } from "@/components/home/FAQ"

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <AprDemo />
      <TrustLogos />
      <CTA />
      <FAQ />
    </>
  )
}
