/**
 * Single-locale number formatting to prevent hydration mismatches.
 * Configurable via NEXT_PUBLIC_NUMBER_LOCALE (default: "en-US").
 */

const LOCALE = process.env.NEXT_PUBLIC_NUMBER_LOCALE || "en-US";

export function formatInt(n: number): string {
  return new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatFloat(n: number, digits = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return formatFloat(n, digits);
}

export function formatCurrency(n: number, suffix = " UZS"): string {
  return formatInt(n) + suffix;
}



