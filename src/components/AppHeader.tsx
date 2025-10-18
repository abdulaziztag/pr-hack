"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { HIDE_DEMO_COPY } from "@/lib/config";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/apply", label: "Apply" },
  { href: "/offers", label: "Offers" },
  { href: "/p2p", label: "P2P" },
  { href: "/pricing", label: "Pricing" },
  { href: "/admin", label: "Admin" },
  { href: "/demo", label: "Demo" },
];

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand + Desktop nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-brand">
            Fair Lend
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 md:flex" role="navigation" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: Theme toggle + Auth + Mobile menu */}
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
                className="hidden text-sm sm:inline-flex"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button
              className="btn-brand hidden rounded-md px-4 py-2 text-sm font-medium sm:inline-flex"
              size="sm"
              asChild
            >
              <Link href="/signin">Sign in</Link>
            </Button>
          )}

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 grid gap-2" aria-label="Mobile navigation">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "min-h-[44px] rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted",
                        pathname === link.href
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {!HIDE_DEMO_COPY && (
                  <p className="mt-8 border-t pt-4 text-xs text-muted-foreground">
                    Simulation only • No real funds.
                  </p>
                )}
                {user && (
                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      Signed in as {user.name}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign out
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

