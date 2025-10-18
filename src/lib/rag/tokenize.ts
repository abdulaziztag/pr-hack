export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s]+/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && w.length <= 32)
}

