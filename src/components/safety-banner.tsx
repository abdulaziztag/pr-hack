"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SAFETY } from "@/lib/safety"
import { resetDemo } from "@/lib/reset"
import { DismissibleBanner } from "@/components/DismissibleBanner"

export function SafetyBanner() {
  if (!SAFETY.demoMode) return null

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all demo data? This will clear your application, offers, P2P state, tariffs, and audit log."
      )
    ) {
      resetDemo()
    }
  }

  return (
    <DismissibleBanner id="safety_banner">
      <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <AlertDescription className="flex flex-wrap items-center justify-between gap-2 pr-8">
          <span className="text-sm text-yellow-900 dark:text-yellow-200">
            <strong>Simulation Only</strong> — No real funds. For hackathon demo.
            Data is stored locally.
          </span>
          <div className="flex gap-2">
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href="/admin/audit">View Audit Log</Link>
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleReset}
              className="h-auto p-0"
            >
              Reset Demo
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </DismissibleBanner>
  )
}

