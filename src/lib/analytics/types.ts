export type EventName =
  | "send_message"
  | "stream_complete"
  | "tool_used"
  | "chip_click"
  | "nav_filter"
  | "error";

export interface EventPayload {
  name: EventName;
  ts: number;
  session: string;
  meta?: Record<string, string | number | boolean | null>;
}

