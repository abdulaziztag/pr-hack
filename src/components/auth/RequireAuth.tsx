"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/auth/types";
import { useAuth } from "@/lib/auth/context";

function rank(r: Role): number {
  return r === "admin" ? 3 : r === "lender" ? 2 : r === "user" ? 1 : 0;
}

export default function RequireAuth({
  role = "user",
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || rank(user.role) < rank(role))) {
      router.push("/signin");
    }
  }, [user, isLoading, role, router]);

  if (isLoading) return null;

  const ok = user && rank(user.role) >= rank(role);
  if (!ok) return null;

  return <>{children}</>;
}



