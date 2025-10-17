import Link from "next/link"
import { FileQuestion, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <FileQuestion className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            404 - Page Not Found
          </CardTitle>
          <CardDescription className="text-center">
            The page you&apos;re looking for doesn&apos;t exist or has been moved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-muted bg-background p-4">
            <p className="mb-3 text-sm font-semibold">
              <Search className="mb-1 inline h-4 w-4" /> Quick Links
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-primary hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Home
                </Link>{" "}
                — Welcome page
              </li>
              <li>
                <Link
                  href="/apply"
                  className="text-primary hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Apply
                </Link>{" "}
                — Start loan application
              </li>
              <li>
                <Link
                  href="/demo"
                  className="text-primary hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Demo
                </Link>{" "}
                — Judge script (one-click flow)
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-primary hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Admin
                </Link>{" "}
                — Admin tools
              </li>
            </ul>
          </div>

          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

