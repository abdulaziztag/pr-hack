export type ChatRole = "system" | "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatPayload {
  messages: ChatMessage[]
  // reserved for future tool calls
  tools?: Array<unknown>
  temperature?: number
}

