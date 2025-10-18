/**
 * The Responses API may stream JSON lines where the text can appear as:
 * - output_text
 * - output[0].content[0].text
 * - content[0].text
 *
 * This normalizes the various formats into a single text string.
 */
export function extractText(chunk: unknown): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = chunk as any
    if (typeof j?.output_text === "string") return j.output_text
    if (typeof j?.content?.[0]?.text === "string") return j.content[0].text
    if (typeof j?.output?.[0]?.content?.[0]?.text === "string")
      return j.output[0].content[0].text
    // Handle standard Chat Completions API format
    if (typeof j?.choices?.[0]?.delta?.content === "string")
      return j.choices[0].delta.content
  } catch {
    // Ignore parse errors
  }
  return ""
}

