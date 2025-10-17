import type { Metadata } from "next"
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SafetyBanner } from "@/components/safety-banner"
import { SafetyFooter } from "@/components/safety-footer"
import { SkipToContent } from "@/components/skip-to-content"
import { LiveAnnouncer } from "@/components/live-announcer"
import { AppHeader } from "@/components/AppHeader"
import { AuthProvider } from "@/lib/auth/context"

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Fair Lend — Transparent Lending Comparison",
    template: "%s — Fair Lend",
  },
  description:
    "Rail-neutral micro-credit comparator with P2P simulation. Compare bank and peer-to-peer loan offers by true APR with explainable fees.",
  keywords: [
    "lending",
    "loan comparison",
    "APR",
    "P2P lending",
    "micro-credit",
    "transparent fees",
  ],
  authors: [{ name: "Fair Lend Team" }],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://localhost:3000",
    title: "Fair Lend — Transparent Lending Comparison",
    description:
      "Rail-neutral micro-credit comparator with P2P simulation. Demo application for hackathon evaluation.",
    siteName: "Fair Lend",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SkipToContent />
            <div className="flex min-h-screen flex-col">
              <SafetyBanner />
              <AppHeader />
              <main id="main" role="main" className="flex-1 pt-0">
                {children}
              </main>
              <SafetyFooter />
            </div>
            <LiveAnnouncer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
