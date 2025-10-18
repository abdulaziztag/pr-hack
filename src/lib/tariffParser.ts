import { RawOffer, FeeClause, Rail } from "./types"
import { toPct, toUZS } from "./num"

export interface ParseInput {
  provider: string
  rail: Rail
  text: string
}

export interface ParseResult {
  offers: RawOffer[]
  warnings: string[]
  errors: string[]
}

interface ParsedValues {
  upfrontPcts: number[]
  monthlyRates: number[]
  dailyRates: number[]
  usageFees: number[]
  disbursementFees: number[]
  closingFees: number[]
  minAmount?: number
  maxAmount?: number
  minDays?: number
  maxDays?: number
}

function cleanText(text: string): string {
  // Normalize whitespace, preserve newlines
  return text.replace(/\s+/g, " ").trim()
}

function extractUpfrontPct(text: string): number[] {
  const patterns = [
    /(\d{1,2}(?:[.,]\d{1,2})?)\s*%\s*(?:upfront|transfer|disbursement)/gi,
    /(upfront|transfer|disbursement)\s+(?:fee\s+)?(?:of\s+)?(\d{1,2}(?:[.,]\d{1,2})?)\s*%/gi,
    /(upfront|transfer|disbursement)\s+fee[:\s]+(\d{1,2}(?:[.,]\d{1,2})?)\s*%/gi,
  ]
  const matches: number[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        const numStr = match[2] || match[1]
        matches.push(toPct(numStr))
      } catch {
        // Skip invalid
      }
    }
  }
  return matches
}

function extractMonthlyRate(text: string): number[] {
  const patterns = [
    // "2% per month" format
    /(\d{1,2}(?:[.,]\d{1,2})?)\s*%\s*(?:per|\/)\s*month/gi,
    // "per month 2%" format  
    /(?:per|\/)\s*month[:\s]+(\d{1,2}(?:[.,]\d{1,2})?)\s*%/gi,
    // "interest rate 2% per month" or similar
    /(?:interest|rate)[^0-9]{0,30}(\d{1,2}(?:[.,]\d{1,2})?)\s*%\s*(?:per|\/)\s*month/gi,
  ]
  const matches: number[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        matches.push(toPct(match[1]))
      } catch {
        // Skip invalid
      }
    }
  }
  return matches
}

function extractDailyRate(text: string): number[] {
  const patterns = [
    /daily\s+(?:interest|rate)\s+(?:of\s+)?(\d{1,2}(?:[.,]\d{1,3})?)\s*%/gi,
    /(\d{1,2}(?:[.,]\d{1,3})?)\s*%\s+(?:per\s+)?day/gi,
  ]
  const matches: number[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        matches.push(toPct(match[1]))
      } catch {
        // Skip invalid
      }
    }
  }
  return matches
}

function extractUsageFee(text: string): number[] {
  const patterns = [
    /(?:usage|service)\s+fee[:\s]+(\d[\d\s.,]*)\s*(?:uzs|so'm|per)/gi,
    /fee[:\s]+(\d[\d\s.,]*)\s*uzs\s+per\s+(?:transaction|usage)/gi,
  ]
  const matches: number[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        matches.push(toUZS(match[1]))
      } catch {
        // Skip invalid
      }
    }
  }
  return matches
}

function extractDisbursementFee(text: string): number[] {
  const patterns = [
    /(?:disbursement|transfer)\s+fee[:\s]+(\d[\d\s.,]*)\s*(?:uzs|so'm)/gi,
  ]
  const matches: number[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        matches.push(toUZS(match[1]))
      } catch {
        // Skip invalid
      }
    }
  }
  return matches
}

function extractClosingFee(text: string): number[] {
  const patterns = [
    /(?:closing|repayment)\s+fee[:\s]+(\d[\d\s.,]*)\s*(?:uzs|so'm)/gi,
    /fee\s+at\s+repayment[:\s]+(\d[\d\s.,]*)\s*(?:uzs|so'm)/gi,
  ]
  const matches: number[] = []
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        matches.push(toUZS(match[1]))
      } catch {
        // Skip invalid
      }
    }
  }
  return matches
}

function extractAmountLimits(text: string): {
  minAmount?: number
  maxAmount?: number
} {
  let minAmount: number | undefined
  let maxAmount: number | undefined

  // Min amount
  const minPattern = /(min(?:imum)?)\s*amount[^0-9]{0,10}(\d[\d\s.,]*)/gi
  const minMatch = minPattern.exec(text)
  if (minMatch) {
    try {
      minAmount = toUZS(minMatch[2])
    } catch {
      // Skip
    }
  }

  // Max amount
  const maxPattern = /(max(?:imum)?)\s*amount[^0-9]{0,10}(\d[\d\s.,]*)/gi
  const maxMatch = maxPattern.exec(text)
  if (maxMatch) {
    try {
      maxAmount = toUZS(maxMatch[2])
    } catch {
      // Skip
    }
  }

  return { minAmount, maxAmount }
}

function extractTermLimits(text: string): {
  minDays?: number
  maxDays?: number
} {
  let minDays: number | undefined
  let maxDays: number | undefined

  // Try to match "from X to Y days" or "X to Y days" pattern first
  const rangePattern = /(?:from\s+)?(\d{1,3})\s+to\s+(\d{1,3})\s+days/gi
  const rangeMatch = rangePattern.exec(text)
  if (rangeMatch) {
    try {
      minDays = parseInt(rangeMatch[1], 10)
      maxDays = parseInt(rangeMatch[2], 10)
      return { minDays, maxDays }
    } catch {
      // Continue to individual patterns
    }
  }

  // Min days
  const minPattern = /(?:min(?:imum)?)\s*(?:term|tenor)?[:\s]+(\d{1,3})\s*days?/gi
  const minMatch = minPattern.exec(text)
  if (minMatch) {
    try {
      minDays = parseInt(minMatch[1], 10)
    } catch {
      // Skip
    }
  }

  // Max days
  const maxPattern = /(?:max(?:imum)?)\s*(?:term|tenor)?[:\s]+(\d{1,3})\s*days?/gi
  const maxMatch = maxPattern.exec(text)
  if (maxMatch) {
    try {
      maxDays = parseInt(maxMatch[1], 10)
    } catch {
      // Skip
    }
  }

  return { minDays, maxDays }
}

function selectDominant(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  if (values.length === 1) return values[0]

  // Choose most frequent value
  const freq = new Map<number, number>()
  for (const v of values) {
    freq.set(v, (freq.get(v) || 0) + 1)
  }

  let maxFreq = 0
  let dominant = values[0]
  // Convert Map entries to Array for iteration
  Array.from(freq.entries()).forEach(([val, count]) => {
    if (count > maxFreq) {
      maxFreq = count
      dominant = val
    }
  })

  return dominant
}

export function parseTariffs(input: ParseInput): ParseResult {
  const warnings: string[] = []
  const errors: string[] = []

  if (!input.provider) {
    errors.push("Provider name is required")
  }
  if (!input.rail) {
    errors.push("Rail type is required")
  }
  if (!input.text || input.text.trim().length < 10) {
    errors.push("Text is too short to parse meaningful tariff data")
  }

  if (errors.length > 0) {
    return { offers: [], warnings, errors }
  }

  const text = cleanText(input.text)

  const parsed: ParsedValues = {
    upfrontPcts: extractUpfrontPct(text),
    monthlyRates: extractMonthlyRate(text),
    dailyRates: extractDailyRate(text),
    usageFees: extractUsageFee(text),
    disbursementFees: extractDisbursementFee(text),
    closingFees: extractClosingFee(text),
    ...extractAmountLimits(text),
    ...extractTermLimits(text),
  }

  // Check for multiple values and emit warnings
  if (parsed.upfrontPcts.length > 1) {
    warnings.push(
      `Multiple upfront fees found (${parsed.upfrontPcts.map((p) => (p * 100).toFixed(1) + "%").join(", ")}); using dominant value`
    )
  }
  if (parsed.monthlyRates.length > 1) {
    warnings.push(
      `Multiple monthly rates found (${parsed.monthlyRates.map((r) => (r * 100).toFixed(2) + "%").join(", ")}); using dominant value`
    )
  }
  if (parsed.dailyRates.length > 1) {
    warnings.push(
      `Multiple daily rates found (${parsed.dailyRates.map((r) => (r * 100).toFixed(3) + "%").join(", ")}); using dominant value`
    )
  }

  // Select dominant values
  const upfrontFeePct = selectDominant(parsed.upfrontPcts)
  const monthlyRatePct = selectDominant(parsed.monthlyRates)
  const dailyRatePct = selectDominant(parsed.dailyRates)
  const usageFeeFlat = selectDominant(parsed.usageFees)
  const disbursementFlat = selectDominant(parsed.disbursementFees)
  const closingFlat = selectDominant(parsed.closingFees)

  // Build fee clauses
  const feeClauses: FeeClause[] = []

  if (upfrontFeePct !== undefined && upfrontFeePct > 0) {
    feeClauses.push({
      label: `${(upfrontFeePct * 100).toFixed(1)}% upfront fee`,
      kind: "upfront",
      plainMeaning: `An upfront fee of ${(upfrontFeePct * 100).toFixed(1)}% is deducted at disbursement.`,
      citation: `Parsed: ${input.provider} tariff`,
    })
  }

  if (monthlyRatePct !== undefined && monthlyRatePct > 0) {
    feeClauses.push({
      label: `${(monthlyRatePct * 100).toFixed(2)}% per month interest`,
      kind: "interest",
      plainMeaning: `Interest accrues at ${(monthlyRatePct * 100).toFixed(2)}% per month.`,
      citation: `Parsed: ${input.provider} tariff`,
    })
  }

  if (dailyRatePct !== undefined && dailyRatePct > 0) {
    feeClauses.push({
      label: `${(dailyRatePct * 100).toFixed(3)}% daily rate`,
      kind: "interest",
      plainMeaning: `Interest accrues daily at approximately ${(dailyRatePct * 100).toFixed(3)}%.`,
      citation: `Parsed: ${input.provider} tariff`,
    })
  }

  if (usageFeeFlat !== undefined && usageFeeFlat > 0) {
    feeClauses.push({
      label: `Usage fee ${usageFeeFlat.toLocaleString()} UZS`,
      kind: "usage",
      plainMeaning: `A usage fee of ${usageFeeFlat.toLocaleString()} UZS applies.`,
      citation: `Parsed: ${input.provider} tariff`,
    })
  }

  if (closingFlat !== undefined && closingFlat > 0) {
    feeClauses.push({
      label: `Closing fee ${closingFlat.toLocaleString()} UZS`,
      kind: "closing",
      plainMeaning: `A closing fee of ${closingFlat.toLocaleString()} UZS is charged at repayment.`,
      citation: `Parsed: ${input.provider} tariff`,
    })
  }

  if (disbursementFlat !== undefined && disbursementFlat > 0) {
    feeClauses.push({
      label: `Disbursement fee ${disbursementFlat.toLocaleString()} UZS`,
      kind: "upfront",
      plainMeaning: `A disbursement fee of ${disbursementFlat.toLocaleString()} UZS is charged when funds are transferred.`,
      citation: `Parsed: ${input.provider} tariff`,
    })
  }

  // Build RawOffer
  const offer: RawOffer = {
    id: `parsed_${input.provider.toLowerCase().replace(/\s+/g, "_")}_${Date.now().toString(36)}`,
    provider: input.provider,
    rail: input.rail,
    upfrontFeePct,
    monthlyRatePct,
    dailyRatePct,
    usageFeeFlat,
    disbursementFlat,
    closingFlat,
    minAmount: parsed.minAmount,
    maxAmount: parsed.maxAmount,
    minDays: parsed.minDays,
    maxDays: parsed.maxDays,
    feeClauses,
    notes: "Auto-parsed from tariff text",
  }

  // Remove undefined fields for cleaner JSON
  Object.keys(offer).forEach((key) => {
    if (offer[key as keyof RawOffer] === undefined) {
      delete offer[key as keyof RawOffer]
    }
  })

  return { offers: [offer], warnings, errors }
}

