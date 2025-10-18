"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, ArrowRight, FileText, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PRESETS, seedTariffsIfEmpty } from "@/lib/seed"
import { runJudgePreset, JudgeResult } from "@/lib/judge"
import { readAnalytics } from "@/lib/analytics"
import { resetDemo } from "@/lib/safety"
import { listEscrows } from "@/lib/escrow"

export default function DemoPage() {
  const router = useRouter()
  const [presetIndex, setPresetIndex] = useState(0)
  const [result, setResult] = useState<JudgeResult | null>(null)
  const [summary, setSummary] = useState("")
  const [running, setRunning] = useState(false)

  const handleRunScript = () => {
    setRunning(true)
    try {
      seedTariffsIfEmpty()
      const res = runJudgePreset(presetIndex)
      setResult(res)
      generateSummary(res)
    } catch (error) {
      console.error("Error running judge script:", error)
    } finally {
      setRunning(false)
    }
  }

  const generateSummary = (res: JudgeResult) => {
    const analytics = readAnalytics()
    let text = "=== JUDGE SUMMARY ===\n\n"

    text += "Applicant:\n"
    text += `  Score: ${res.applicant.score} (Bucket ${res.applicant.bucket})\n`
    text += `  Amount: ${res.applicant.amount.toLocaleString()} UZS\n`
    text += `  Term: ${res.applicant.termDays} days\n`
    text += `  Monthly Income: ${res.applicant.monthlyIncome.toLocaleString()} UZS\n\n`

    text += `Eligible (${res.eligible.length}):\n`
    res.eligible.forEach((e) => {
      text += `  ${e.provider} (${e.rail}) — ${e.apr}% APR — ${e.total.toLocaleString()} UZS total\n`
    })
    text += "\n"

    if (res.ineligible.length > 0) {
      text += `Ineligible (${res.ineligible.length}):\n`
      res.ineligible.forEach((i) => {
        text += `  ${i.provider} — ${i.reason}\n`
      })
      text += "\n"
    }

    if (res.escrow) {
      text += "Escrow:\n"
      text += `  ID: ${res.escrow.id}\n`
      text += `  Status: ${res.escrow.status}\n`
      text += `  Target: ${res.escrow.target.toLocaleString()} UZS\n`
      text += `  Funded: ${res.escrow.funded.toLocaleString()} UZS\n`
      text += `  Pledges: ${res.escrow.pledges}\n\n`
    }

    text += "Analytics:\n"
    text += `  apply_submits: ${analytics.counts.apply_submits}\n`
    text += `  offers_views: ${analytics.counts.offers_views}\n`
    text += `  explain_fee_opens: ${analytics.counts.explain_fee_opens}\n`
    text += `  p2p_posts: ${analytics.counts.p2p_posts}\n`
    text += `  p2p_funded: ${analytics.counts.p2p_funded}\n`
    text += `  escrow_release: ${analytics.counts.escrow_release}\n`
    text += `  admin_tariffs_save: ${analytics.counts.admin_tariffs_save}\n`

    setSummary(text)
  }

  const handleOpenOffers = () => {
    router.push("/offers")
  }

  const handleOpenEscrow = () => {
    const escrows = listEscrows()
    if (escrows.length > 0) {
      const latest = escrows[escrows.length - 1]
      router.push(`/p2p/escrow/${latest.id}`)
    }
  }

  const handleReset = () => {
    resetDemo()
    setResult(null)
    setSummary("")
  }

  const latestEscrow = listEscrows().pop()

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
              Judge Script
            </h1>
            <p className="text-muted-foreground">
              One-click demo path for judges • All data is local and simulated
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
                <CardDescription>
                  Run the complete demo flow with one click
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="preset"
                    className="text-sm font-medium leading-none"
                  >
                    Demo Preset
                  </label>
                  <Select
                    value={presetIndex.toString()}
                    onValueChange={(v) => setPresetIndex(parseInt(v, 10))}
                  >
                    <SelectTrigger id="preset">
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESETS.map((p, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRunScript}
                  disabled={running}
                  className="w-full"
                  size="lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {running ? "Running..." : "Run Script"}
                </Button>

                <div className="space-y-2">
                  <Button
                    onClick={handleOpenOffers}
                    variant="outline"
                    className="w-full"
                    disabled={!result}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Open Offers Page
                  </Button>

                  <Button
                    onClick={handleOpenEscrow}
                    variant="outline"
                    className="w-full"
                    disabled={!latestEscrow}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Open P2P Escrow
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="destructive"
                    className="w-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Output */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Plaintext output for judges</CardDescription>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <Textarea
                      value={summary}
                      readOnly
                      className="min-h-[400px] font-mono text-xs"
                    />
                    <Button
                      onClick={() => navigator.clipboard.writeText(summary)}
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                  </div>
                ) : (
                  <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      Run the script to see summary
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Result Cards */}
          {result && (
            <div className="mt-6 space-y-6">
              {/* Applicant */}
              <Card>
                <CardHeader>
                  <CardTitle>Applicant Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-2xl font-bold">
                        {result.applicant.score}
                      </p>
                      <Badge
                        variant={
                          result.applicant.bucket === "A"
                            ? "default"
                            : "secondary"
                        }
                      >
                        Bucket {result.applicant.bucket}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-xl font-semibold">
                        {result.applicant.amount.toLocaleString()} UZS
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Term</p>
                      <p className="text-xl font-semibold">
                        {result.applicant.termDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Monthly Income
                      </p>
                      <p className="text-xl font-semibold">
                        {result.applicant.monthlyIncome.toLocaleString()} UZS
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eligible Offers */}
              {result.eligible.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Eligible Offers ({result.eligible.length})
                    </CardTitle>
                    <CardDescription>Ranked by APR</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.eligible.map((e, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-semibold">{e.provider}</p>
                            <Badge variant="outline" className="mt-1">
                              {e.rail}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {e.apr}% APR
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {e.total.toLocaleString()} UZS total
                            </p>      </div>
    </div>
  ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ineligible Offers */}
              {result.ineligible.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Ineligible Offers ({result.ineligible.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.ineligible.map((i, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                        >
                          <p className="font-semibold">{i.provider}</p>
                          <p className="text-sm text-muted-foreground">
                            {i.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Escrow */}
              {result.escrow && (
                <Card>
                  <CardHeader>
                    <CardTitle>P2P Escrow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Escrow ID
                        </p>
                        <p className="font-mono text-sm">
                          {result.escrow.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="default">{result.escrow.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Funded</p>
                        <p className="text-lg font-semibold">
                          {result.escrow.funded.toLocaleString()} /{" "}
                          {result.escrow.target.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pledges
                        </p>
                        <p className="text-lg font-semibold">
                          {result.escrow.pledges}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Counters</CardTitle>
                  <CardDescription>Session activity tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(readAnalytics().counts).map(
                      ([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-muted-foreground">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-2xl font-bold">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}      </div>
    </div>
  )
}

