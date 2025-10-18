import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface P2PBreadcrumbsProps {
  trail?: "borrow" | "lend"
}

export function P2PBreadcrumbs({ trail }: P2PBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          <Link
            href="/p2p"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            P2P
          </Link>
        </li>
        {trail && (
          <>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="font-medium text-foreground" aria-current="page">
              {trail === "borrow" ? "Borrow" : "Lend"}
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}

