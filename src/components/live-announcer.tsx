"use client"

import { useEffect, useState } from "react"
import { bindAnnouncer } from "@/lib/announce"

export function LiveAnnouncer() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    bindAnnouncer((msg) => {
      setMessage(msg)
      // Clear after announcement to allow same message to be announced again
      setTimeout(() => setMessage(""), 1000)
    })
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

