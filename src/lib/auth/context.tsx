"use client";

import * as React from "react";
import type { AuthState, DemoUser, Role } from "./types";
import { loadUser, saveUser } from "./storage";
import { ACCESS_CODES, DEV_ROLE_SHORTCUTS } from "@/lib/config";

export const AuthCtx = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<DemoUser | null>(null);
  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const u = loadUser();
    setUser(u);
    saveUser(u);
    setLoading(false);
  }, []);

  async function signIn({
    email,
    password,
    code,
    role,
  }: {
    email?: string;
    password?: string;
    code?: string;
    role?: Role;
  }) {
    // Access code path
    if (code) {
      const map = ACCESS_CODES;
      const found =
        (map.user && code === map.user && "user") ||
        (map.lender && code === map.lender && "lender") ||
        (map.admin && code === map.admin && "admin") ||
        null;
      if (found) {
        const u = { id: crypto.randomUUID(), name: "Member", role: found as Role };
        setUser(u);
        saveUser(u);
        return;
      }
      throw new Error("Invalid code");
    }

    // Dev-only quick roles (hidden unless DEV flag or ?dev=1)
    if (
      (DEV_ROLE_SHORTCUTS ||
        (typeof window !== "undefined" &&
          new URLSearchParams(location.search).has("dev"))) &&
      role &&
      role !== "guest"
    ) {
      const u = { id: crypto.randomUUID(), name: "Member", role };
      setUser(u);
      saveUser(u);
      return;
    }

    // Simple email/password path (accept anything non-empty)
    if (email && password) {
      const u = {
        id: crypto.randomUUID(),
        name: email.split("@")[0] || "Member",
        role: "user" as Role,
        email,
      };
      setUser(u);
      saveUser(u);
      return;
    }

    throw new Error("Provide access code or sign-in details");
  }

  function signOut() {
    setUser(null);
    saveUser(null);
  }

  const value: AuthState = { user, signIn, signOut, isLoading };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}



