"use client"

import React from "react"

export default class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  state = { error: undefined as Error | undefined }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-3 rounded-lg border bg-red-50 p-3 text-sm text-red-900 dark:bg-red-900/20 dark:text-red-100">
          <strong>Something went wrong in chat UI.</strong> Please try again or
          refresh the page.
        </div>
      )
    }
    return this.props.children as any
  }
}

