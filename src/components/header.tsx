"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold text-brand">Fair Lend</span>
          </Link>
          <nav
            className="hidden items-center gap-4 md:flex"
            role="navigation"
            aria-label="Primary"
          >
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Home
            </Link>
            <Link
              href="/apply"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Apply
            </Link>
            <Link
              href="/offers"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Offers
            </Link>
            <Link
              href="/p2p"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              P2P
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Pricing
            </Link>
            <Link
              href="/admin/tariffs"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Admin
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Demo
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-sm"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button
              className="btn-brand rounded-md px-4 py-2 text-sm font-medium"
              size="sm"
              asChild
            >
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
