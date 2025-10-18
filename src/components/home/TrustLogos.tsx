import Image from "next/image"

const logos = [
  { src: "/brands/uzb-bank-1.svg", alt: "Bank partner 1" },
  { src: "/brands/uzb-bank-2.svg", alt: "Bank partner 2" },
  { src: "/brands/uzb-bank-3.svg", alt: "Bank partner 3" },
  { src: "/brands/p2p.svg", alt: "P2P platform" },
]

export function TrustLogos() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Sample institutions (demo)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {logos.map((logo) => (
            <div
              key={logo.src}
              className="grayscale opacity-70 transition-opacity hover:opacity-100"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

