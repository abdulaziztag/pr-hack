import type { EventPayload } from "./types";

const BUF: EventPayload[] = [];
const MAX = 500;

export function pushEvent(e: EventPayload) {
  BUF.push(e);
  if (BUF.length > MAX) BUF.shift();
}

export function readEvents(): EventPayload[] {
  return BUF.slice().reverse();
}

