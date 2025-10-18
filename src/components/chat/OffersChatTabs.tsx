"use client"

import * as React from "react"

interface OffersChatTabsProps {
  offersContent: React.ReactNode
  chatContent?: React.ReactNode
}

export default function OffersChatTabs({
  offersContent,
  chatContent,
}: OffersChatTabsProps) {
  const [tab, setTab] = React.useState<"offers" | "chat">("offers")

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <div className="sticky top-14 z-10 grid grid-cols-2 border-b bg-background">
        <button
          className={`py-3 text-sm font-medium transition-colors ${
            tab === "offers"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("offers")}
          aria-selected={tab === "offers"}
          role="tab"
          aria-controls="offers-panel"
        >
          Offers
        </button>
        <button
          className={`py-3 text-sm font-medium transition-colors ${
            tab === "chat"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("chat")}
          aria-selected={tab === "chat"}
          role="tab"
          aria-controls="chat-panel"
        >
          Chat
        </button>
      </div>
      <div
        className="flex-1 overflow-auto"
        role="tabpanel"
        id={tab === "offers" ? "offers-panel" : "chat-panel"}
      >
        {tab === "offers" ? offersContent : chatContent}
      </div>
    </div>
  )
}

