"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Calculator, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RequireAuth from "@/components/auth/RequireAuth"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Rail, NormalizedOffer } from "@/lib/types"
import { parseTariffs, ParseResult } from "@/lib/tariffParser"
import { validateOffer, OfferIssue } from "@/lib/offerValidate"
import { incr } from "@/lib/analytics"
import { normalizeOffer } from "@/lib/apr"
import {
  saveVersion,
  generateTariffId,
  TariffVersion,
} from "@/lib/tariffsStore"
import { toast } from "sonner"
import { logAudit } from "@/lib/audit"

export default function AdminTariffsPage() {
  const [provider, setProvider] = useState("")
  const [rail, setRail] = useState<Rail>("BANK")
  const [notes, setNotes] = useState("")
  const [rawText, setRawText] = useState("")
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [validationIssues, setValidationIssues] = useState<OfferIssue[]>([])

  // Preview APR fields
  const [previewAmount, setPreviewAmount] = useState("1000000")
  const [previewTermDays, setPreviewTermDays] = useState("30")
  const [normalizedOffers, setNormalizedOffers] = useState<
    (NormalizedOffer | null)[]
  >([])

  const handleCleanText = () => {
    const cleaned = rawText.replace(/\s+/g, " ").trim()
    setRawText(cleaned)
    toast.success("Text normalized")
  }

  const handleParse = () => {
    if (!provider.trim()) {
      toast.error("Provider name is required")
      return
    }
    if (!rawText.trim()) {
      toast.error("Tariff text is required")
      return
    }

    const result = parseTariffs({ provider, rail, text: rawText })
    setParseResult(result)

    // Validate all offers
    const allIssues: OfferIssue[] = []
    result.offers.forEach((offer) => {
      const issues = validateOffer(offer)
      allIssues.push(...issues)
    })
    setValidationIssues(allIssues)

    // Clear APR preview
    setNormalizedOffers([])

    if (result.errors.length > 0) {
      toast.error(`Parse failed: ${result.errors[0]}`)
    } else if (result.offers.length === 0) {
      toast.warning("No offers parsed from text")
    } else {
      toast.success(
        `Parsed ${result.offers.length} offer(s) with ${result.warnings.length} warning(s)`
      )
    }
  }

  const handlePreviewAPR = () => {
    if (!parseResult || parseResult.offers.length === 0) {
      toast.error("No parsed offers to preview")
      return
    }

    const amount = parseInt(previewAmount, 10)
    const termDays = parseInt(previewTermDays, 10)

    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount for preview")
      return
    }
    if (isNaN(termDays) || termDays <= 0) {
      toast.error("Invalid term days for preview")
      return
    }

    const normalized = parseResult.offers.map((offer) =>
      normalizeOffer(offer, amount, termDays)
    )
    setNormalizedOffers(normalized)
    toast.success("APR preview computed")
  }

  const handleSave = () => {
    if (!parseResult || parseResult.offers.length === 0) {
      toast.error("No offers to save")
      return
    }

    // Check for errors
    const hasErrors =
      parseResult.errors.length > 0 ||
      validationIssues.some((issue) => issue.severity === "error")

    if (hasErrors) {
      toast.error(
        "Cannot save: Fix validation errors first. Check the Issues section."
      )
      return
    }

    const version: TariffVersion = {
      id: generateTariffId(),
      provider,
      rail,
      createdAt: Date.now(),
      notes: notes.trim() || undefined,
      rawText: rawText.trim(),
      offers: parseResult.offers,
    }

    saveVersion(version)
    
    // Log audit event
    logAudit("TARIFFS_SAVE", {
      provider,
      rail,
      offersCount: version.offers.length,
    })

    // Track analytics
    incr("admin_tariffs_save")

    toast.success(
      `Tariff version saved: ${version.id} (${version.offers.length} offer(s))`
    )

    // Reset form
    setProvider("")
    setRail("BANK")
    setNotes("")
    setRawText("")
    setParseResult(null)
    setValidationIssues([])
    setNormalizedOffers([])
  }

  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const errorCount = validationIssues.filter(
    (i) => i.severity === "error"
  ).length
  const warnCount = validationIssues.filter((i) => i.severity === "warn").length

  return (
    // eslint-disable-next-line jsx-a11y/aria-role
    <RequireAuth role="admin">
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Admin
            </Link>
          </Button>

          <h1 className="mb-6 text-3xl font-bold">Tariff Parser</h1>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Panel: Form */}
            <Card>
              <CardHeader>
                <CardTitle>Parse Tariff Text</CardTitle>
                <CardDescription>
                  Paste tariff text, parse fee patterns, and save structured
                  offers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider">Provider Name</Label>
                  <Input
                    id="provider"
                    placeholder="e.g., Bank A Micro"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="rail">Rail</Label>
                  <Select value={rail} onValueChange={(v) => setRail(v as Rail)}>
                    <SelectTrigger id="rail">
                      <SelectValue placeholder="Select rail" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK">BANK</SelectItem>
                      <SelectItem value="P2P">P2P</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Internal notes or version comments"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label htmlFor="rawText">Tariff Text</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCleanText}
                      disabled={!rawText.trim()}
                    >
                      Clean text
                    </Button>
                  </div>
                  <Textarea
                    id="rawText"
                    placeholder="Paste tariff text here (e.g., fee schedules, terms, conditions)"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleParse}
                    disabled={!provider.trim() || !rawText.trim()}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    Parse
                  </Button>
                </div>

                {/* Preview APR Section */}
                {parseResult && parseResult.offers.length > 0 && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base">Preview APR</CardTitle>
                      <CardDescription>
                        Provide intake values to compute APR for parsed offers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="previewAmount">Amount (UZS)</Label>
                        <Input
                          id="previewAmount"
                          type="number"
                          value={previewAmount}
                          onChange={(e) => setPreviewAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="previewTermDays">Term (days)</Label>
                        <Input
                          id="previewTermDays"
                          type="number"
                          value={previewTermDays}
                          onChange={(e) => setPreviewTermDays(e.target.value)}
                        />
                      </div>
                      <Button onClick={handlePreviewAPR} className="w-full">
                        <Calculator
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Compute APR
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Save Button */}
                {parseResult && parseResult.offers.length > 0 && (
                  <Button
                    onClick={handleSave}
                    disabled={errorCount > 0 || parseResult.errors.length > 0}
                    className="w-full"
                    variant="default"
                  >
                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                    Save Version
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Right Panel: Results */}
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Parsed offers, APR preview, and validation issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!parseResult && (
                  <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                    <div>
                      <FileText className="mx-auto mb-4 h-12 w-12 opacity-20" />
                      <p>No results yet. Fill in the form and click Parse.</p>      </div>
    </div>
  )}

                {parseResult && (
                  <Tabs defaultValue="json">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="json">
                        Offers JSON ({parseResult.offers.length})
                      </TabsTrigger>
                      <TabsTrigger value="apr">APR Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="json" className="space-y-4">
                      <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs">
                        {JSON.stringify(parseResult.offers, null, 2)}
                      </pre>
                    </TabsContent>

                    <TabsContent value="apr" className="space-y-4">
                      {normalizedOffers.length === 0 ? (
                        <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                          <div>
                            <Calculator className="mx-auto mb-4 h-12 w-12 opacity-20" />
                            <p>
                              Click &quot;Compute APR&quot; in the Preview APR
                              panel to see results.
                            </p>      </div>
    </div>
  ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Provider</TableHead>
                                <TableHead>Rail</TableHead>
                                <TableHead>Upfront %</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead className="text-right">
                                  APR
                                </TableHead>
                                <TableHead className="text-right">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {normalizedOffers.map((offer, idx) => {
                                if (!offer) {
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground"
                                      >
                                        Out of range for intake params
                                      </TableCell>
                                    </TableRow>
                                  )
                                }
                                const rawOffer = parseResult.offers[idx]
                                const rateStr = rawOffer.monthlyRatePct
                                  ? `${(rawOffer.monthlyRatePct * 100).toFixed(2)}% /mo`
                                  : rawOffer.dailyRatePct
                                    ? `${(rawOffer.dailyRatePct * 100).toFixed(3)}% /day`
                                    : "—"

                                return (
                                  <TableRow key={offer.id}>
                                    <TableCell className="font-medium">
                                      {offer.provider}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {offer.rail}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {rawOffer.upfrontFeePct
                                        ? `${(rawOffer.upfrontFeePct * 100).toFixed(1)}%`
                                        : "—"}
                                    </TableCell>
                                    <TableCell>{rateStr}</TableCell>
                                    <TableCell className="text-right font-semibold text-primary">
                                      {offer.aprPct.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      {formatUZS(offer.totalRepay)} UZS
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {/* Issues */}
                {(parseResult?.warnings.length ||
                  parseResult?.errors.length ||
                  validationIssues.length) && (
                  <div className="mt-4 space-y-2" aria-live="polite">
                    <h3 className="font-semibold">Issues</h3>

                    {parseResult?.errors.map((err, idx) => (
                      <Alert key={`err-${idx}`} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{err}</AlertDescription>
                      </Alert>
                    ))}

                    {parseResult?.warnings.map((warn, idx) => (
                      <Alert key={`warn-${idx}`}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{warn}</AlertDescription>
                      </Alert>
                    ))}

                    {validationIssues.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          {errorCount > 0 && (
                            <Badge variant="destructive">
                              {errorCount} error(s)
                            </Badge>
                          )}
                          {warnCount > 0 && (
                            <Badge variant="secondary">
                              {warnCount} warning(s)
                            </Badge>
                          )}
                        </div>
                        <ul className="ml-4 list-disc space-y-1 text-sm">
                          {validationIssues.map((issue, idx) => (
                            <li
                              key={idx}
                              className={
                                issue.severity === "error"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }
                            >
                              <strong>{issue.path}:</strong> {issue.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>      </div>
    </div>
    </RequireAuth>
  )
}

