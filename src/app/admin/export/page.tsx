"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { exportAll, importAll, listVersions } from "@/lib/tariffsStore"
import { toast } from "sonner"
import { resetDemo } from "@/lib/reset"
import { clearAllDismissed } from "@/lib/dismiss"

export default function AdminExportPage() {
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [versionsCount, setVersionsCount] = useState(0)

  useEffect(() => {
    // Load export data
    const data = exportAll()
    setExportData(JSON.stringify(data, null, 2))
    setVersionsCount(data.length)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData)
    toast.success("Copied to clipboard")
  }

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fairlend-tariffs-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }

  const handleImport = () => {
    setImportError(null)

    if (!importData.trim()) {
      setImportError("Import data is empty")
      return
    }

    try {
      const parsed = JSON.parse(importData)

      if (!Array.isArray(parsed)) {
        setImportError("Invalid format: expected an array of TariffVersion")
        return
      }

      // Basic validation
      for (const item of parsed) {
        if (!item.id || !item.provider || !item.rail || !item.offers) {
          setImportError(
            "Invalid format: missing required fields (id, provider, rail, offers)"
          )
          return
        }
        if (!Array.isArray(item.offers)) {
          setImportError("Invalid format: offers must be an array")
          return
        }
      }

      importAll(parsed)
      toast.success(`Imported ${parsed.length} tariff version(s)`)

      // Refresh export data
      const updated = exportAll()
      setExportData(JSON.stringify(updated, null, 2))
      setVersionsCount(updated.length)

      // Clear import field
      setImportData("")
    } catch (err) {
      if (err instanceof Error) {
        setImportError(`JSON parse error: ${err.message}`)
      } else {
        setImportError("Unknown error during import")
      }
    }
  }

  const handleRefresh = () => {
    const data = exportAll()
    setExportData(JSON.stringify(data, null, 2))
    setVersionsCount(data.length)
    toast.success("Refreshed export data")
  }

  const handleResetAll = () => {
    if (
      window.confirm(
        "Reset ALL demo data? This will clear everything and navigate to home."
      )
    ) {
      resetDemo()
    }
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Admin
            </Link>
          </Button>

          <h1 className="mb-6 text-3xl font-bold">Data Export/Import</h1>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
                <CardDescription>
                  Copy or download all tariff versions as JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Tariff Data ({versionsCount} version(s))</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      aria-label="Refresh export data"
                    >
                      Refresh
                    </Button>
                  </div>
                  <Textarea
                    value={exportData}
                    readOnly
                    rows={16}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCopy} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Download JSON
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    Export includes all saved tariff versions with parsed
                    offers, metadata, and timestamps. Use this to back up your
                    data or transfer between sessions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Import */}
            <Card>
              <CardHeader>
                <CardTitle>Import</CardTitle>
                <CardDescription>
                  Paste JSON data to import tariff versions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="importData">Import Data (JSON)</Label>
                  <Textarea
                    id="importData"
                    placeholder='Paste JSON array of TariffVersion objects here...'
                    value={importData}
                    onChange={(e) => {
                      setImportData(e.target.value)
                      setImportError(null)
                    }}
                    rows={16}
                    className="font-mono text-xs"
                  />
                </div>

                <Button onClick={handleImport} className="w-full">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Validate & Import
                </Button>

                {importError && (
                  <Alert variant="destructive">
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <AlertDescription>
                    Import will merge new versions with existing data. Duplicate
                    IDs will be skipped to prevent overwrites. Ensure your JSON
                    follows the TariffVersion schema.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Current Versions List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Versions</CardTitle>
              <CardDescription>
                All tariff versions currently in sessionStorage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versionsCount === 0 ? (
                <p className="text-center text-muted-foreground">
                  No tariff versions saved yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {listVersions().map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-semibold">{v.provider}</p>
                        <p className="text-sm text-muted-foreground">
                          {v.rail} • {v.offersCount} offer(s) •{" "}
                          {new Date(v.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.id}      </div>
    </div>
  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reset All */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Clear all demo data including applications, offers, P2P state,
                  tariffs, and audit log.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleResetAll}
                  className="w-full"
                >
                  Reset All Demo Data
                </Button>
              </div>
              <div className="border-t pt-3">
                <p className="mb-2 text-sm text-muted-foreground">
                  Clear dismissed banners and ribbons (they will reappear on next page load).
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    clearAllDismissed();
                    toast.success("Dismissed banners cleared");
                  }}
                  className="w-full"
                >
                  Clear Dismissed Banners
                </Button>
              </div>
            </CardContent>
          </Card>      </div>
    </div>
  )
}

