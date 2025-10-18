/** Strip dangerous HTML fragments from streamed markdown-ish text (defense-in-depth). */
export function stripDangerousHtml(s: string): string {
  // We do not render HTML as HTML, but guard anyway against accidental tags.
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
}

