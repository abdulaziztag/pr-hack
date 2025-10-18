"use client";

import React from "react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { isLenderReady } from "@/lib/gates";

interface LenderGuardProps {
  children: React.ReactNode;
}

export function LenderGuard({ children }: LenderGuardProps) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(isLenderReady());
  }, []);

  if (!ready) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          <strong>Onboarding required.</strong> Complete lender onboarding to
          access your wallet and lending features.
        </AlertDescription>
        <div className="mt-4">
          <Button asChild variant="default">
            <Link href="/p2p/lend/onboarding">Go to Onboarding</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  return <>{children}</>;
}

