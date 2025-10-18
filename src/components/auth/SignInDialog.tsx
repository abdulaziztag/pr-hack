"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/context";
import { DEV_ROLE_SHORTCUTS } from "@/lib/config";
import type { Role } from "@/lib/auth/types";

export default function SignInDialog() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn({
        email: email || undefined,
        password: password || undefined,
        code: code || undefined,
      });
    } catch (e: unknown) {
      const error = e as Error;
      setErr(error?.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  const showDev =
    DEV_ROLE_SHORTCUTS ||
    (typeof window !== "undefined" &&
      new URLSearchParams(location.search).has("dev"));

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-xl border bg-card p-6">
      <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </div>
        <div>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Password (optional)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="text-center text-xs text-muted-foreground">or</div>
        <div>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
          />
        </div>
        {err && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--brand-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {busy ? "…" : "Continue"}
        </button>
      </form>
      {showDev && (
        <div className="mt-4 flex justify-center gap-2 border-t pt-4">
          {(["user", "lender", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => signIn({ role: r })}
              className="rounded-full border px-3 py-1 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



