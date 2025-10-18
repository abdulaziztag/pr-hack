const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const PHONE = /\b(?:\+?\d{1,3}[-.\s()]*)?(?:\d{2,3}[-.\s()]*){2,4}\d{2,4}\b/g
const PASSPORT = /\b[A-Z]{2}\d{7}\b/gi // toy example
const CARD = /\b(?:\d[ -]*?){13,19}\b/g

export function redactPII(input: string): { text: string; changed: boolean } {
  let t = input
  const before = t
  t = t.replace(EMAIL, "[redacted@email]")
  t = t.replace(CARD, "[redacted-card]")
  t = t.replace(PHONE, (m) => (m.length >= 7 ? "[redacted-phone]" : m))
  t = t.replace(PASSPORT, "[redacted-passport]")
  return { text: t, changed: t !== before }
}

