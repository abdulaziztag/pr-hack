import Link from "next/link"
import { FileText, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-2 text-4xl font-bold">Admin Panel</h1>
            <p className="mb-12 text-lg text-muted-foreground">
              Manage tariff data, parse new offers, and export/import
              configurations.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Tariff Parser</CardTitle>
                  <CardDescription>
                    Parse tariff text into structured offers, validate, preview
                    APR calculations, and save versioned records.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button asChild className="w-full">
                    <Link href="/admin/tariffs">
                      Go to Tariffs
                      <ArrowRight
                        className="ml-2 h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Data Export/Import</CardTitle>
                  <CardDescription>
                    Export all tariff versions as JSON or import existing
                    configurations from backup files.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/export">
                      Go to Export
                      <ArrowRight
                        className="ml-2 h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
              <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-200">
                Demo Mode
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                This is a demonstration admin panel. All data is stored in
                sessionStorage and will be cleared when the session ends. For
                production use, integrate with a persistent backend.
              </p>
            </div>
          </div>
      </div>
    </div>
  )
}

