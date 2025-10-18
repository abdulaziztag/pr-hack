"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import NumberText from "@/components/intl/NumberText"

// Simple mock offers for demo
const DEMO_OFFERS = [
  {
    provider: "Bank A Micro",
    rail: "BANK" as const,
    rateDailyPct: 0.001,
    fees: { origination: 50000 },
  },
  {
    provider: "Bank B Lite",
    rail: "BANK" as const,
    rateDailyPct: 0.0008,
    fees: { origination: 30000, monthly: 15000 },
  },
  {
    provider: "P2P Pool",
    rail: "P2P" as const,
    rateDailyPct: 0.0012,
    fees: { platform: 25000 },
  },
]

export function AprDemo() {
  const router = useRouter()
  const [amount, setAmount] = useState("1500000")
  const [termDays, setTermDays] = useState<string>("30")

  const amountNum = parseInt(amount) || 0
  const termNum = parseInt(termDays) || 30

  const results = DEMO_OFFERS.map((offer) => {
    const interest = amountNum * offer.rateDailyPct * termNum
    const allFees = Object.values(offer.fees).reduce((sum, f) => sum + f, 0)
    const totalRepay = amountNum + interest + allFees
    const apr = ((totalRepay - amountNum) / amountNum) * (365 / termNum) * 100

    return {
      provider: offer.provider,
      rail: offer.rail,
      apr: apr,
      total: totalRepay,
    }
  })

  const handleUseInputs = () => {
    // Save to sessionStorage
    const data = {
      amount: amountNum,
      termDays: termNum,
    }
    sessionStorage.setItem("fairlend.intake", JSON.stringify(data))

    // Navigate to offers
    router.push("/offers")
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Try the APR Calculator</CardTitle>
              <CardDescription>
                See how we normalize different fee structures into one
                comparable APR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="demo-amount">Amount (UZS)</Label>
                  <Input
                    id="demo-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100000"
                    step="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-term">Term (days)</Label>
                  <Select value={termDays} onValueChange={setTermDays}>
                    <SelectTrigger id="demo-term">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results table */}
              {amountNum >= 100000 && (
                <div className="rounded-lg border">
                  <Table>
                    <caption className="sr-only">
                      Sample APR comparison for demo purposes
                    </caption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Rail</TableHead>
                        <TableHead className="text-right">APR %</TableHead>
                        <TableHead className="text-right">Total (UZS)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.provider}>
                          <TableCell className="font-medium">
                            {result.provider}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.rail === "BANK" ? "default" : "secondary"
                              }
                            >
                              {result.rail}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            <NumberText value={result.apr} decimals={2} suffix="%" />
                          </TableCell>
                          <TableCell className="text-right">
                            <NumberText value={result.total} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Button onClick={handleUseInputs} className="w-full">
                Use these inputs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

