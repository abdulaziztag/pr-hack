/**
 * Convert a percentage string to a decimal (e.g., "5.5%" → 0.055)
 * Handles commas as decimal separators and strips spaces
 */
export const toPct = (s: string): number => {
  return Number(s.replace(/\s+/g, "").replace(",", ".")) / 100
}

/**
 * Convert a UZS amount string to a number (e.g., "1 000 000" → 1000000)
 * Strips all non-digit characters
 */
export const toUZS = (s: string): number => {
  return Number(s.replace(/[^\d]/g, ""))
}

