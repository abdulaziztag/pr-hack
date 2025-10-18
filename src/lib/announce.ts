let cb: ((msg: string) => void) | null = null

export function bindAnnouncer(fn: (msg: string) => void) {
  cb = fn
}

export function announce(msg: string) {
  cb?.(msg)
}

