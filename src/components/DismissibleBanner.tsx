"use client";

import * as React from "react";
import { dismiss, isDismissed, DismissKey } from "@/lib/dismiss";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function DismissibleBanner({
  id,
  children,
  className,
}: {
  id: DismissKey;
  children: React.ReactNode;
  className?: string;
}) {
  const [hidden, setHidden] = React.useState<boolean>(true);

  React.useEffect(() => {
    setHidden(isDismissed(id));
  }, [id]);

  if (hidden) return null;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="absolute right-2 top-2 z-10 rounded p-1 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Dismiss"
        onClick={() => {
          dismiss(id);
          setHidden(true);
        }}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}

