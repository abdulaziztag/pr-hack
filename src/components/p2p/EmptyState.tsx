import { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  )
}

