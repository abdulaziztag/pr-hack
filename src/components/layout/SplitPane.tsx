"use client"

import * as React from "react"

type Props = {
  left: React.ReactNode
  right: React.ReactNode
  storageKey?: string // default: "offers.split"
  minLeft?: number // px
  minRight?: number // px
  className?: string
}

export default function SplitPane({
  left,
  right,
  storageKey = "offers.split",
  minLeft = 320,
  minRight = 360,
  className,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = React.useState<number>(() => {
    if (typeof window === "undefined") return 0.55
    try {
      const raw = sessionStorage.getItem(storageKey)
      return raw ? Number(raw) : 0.55
    } catch {
      return 0.55
    }
  })
  const [drag, setDrag] = React.useState(false)

  React.useEffect(() => {
    // Persist ratio to sessionStorage
    try {
      sessionStorage.setItem(storageKey, String(ratio))
    } catch {
      // Ignore if sessionStorage is unavailable
    }
  }, [ratio, storageKey])

  React.useEffect(() => {
    const up = () => setDrag(false)
    const move = (e: MouseEvent) => {
      if (!drag || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.min(
        Math.max(e.clientX - rect.left, minLeft),
        rect.width - minRight
      )
      setRatio(x / rect.width)
    }
    window.addEventListener("mouseup", up)
    window.addEventListener("mousemove", move)
    return () => {
      window.removeEventListener("mouseup", up)
      window.removeEventListener("mousemove", move)
    }
  }, [drag, minLeft, minRight])

  return (
    <div
      ref={containerRef}
      className={`hidden md:flex md:gap-0 ${className ?? ""}`}
      role="separator"
      aria-orientation="horizontal"
    >
      <div
        style={{ width: `${ratio * 100}%` }}
        className="min-w-0 overflow-auto"
      >
        {left}
      </div>
      <button
        type="button"
        aria-label="Resize chat panel. Use left and right arrow keys to adjust."
        tabIndex={0}
        onMouseDown={() => setDrag(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setRatio((r) => Math.max(0.3, r - 0.02))
          if (e.key === "ArrowRight") setRatio((r) => Math.min(0.7, r + 0.02))
        }}
        className="w-px cursor-col-resize select-none border-0 bg-border p-0 hover:bg-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors"
        style={{ touchAction: "none" }}
      />
      <div
        style={{ width: `${(1 - ratio) * 100}%` }}
        className="min-w-0 overflow-auto"
      >
        {right}
      </div>
    </div>
  )
}

