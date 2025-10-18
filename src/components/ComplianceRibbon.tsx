"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";
import { POLICY_CURRENT } from "@/lib/policy";
import { DismissibleBanner } from "@/components/DismissibleBanner";

export function ComplianceRibbon() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <DismissibleBanner id="compliance_ribbon">
        <Alert className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between gap-4 pr-8">
            <span className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Simulation only</strong> — No real funds. Data local to your
              browser.
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="border-blue-300 text-blue-900 dark:border-blue-700 dark:text-blue-100">
                Policy {POLICY_CURRENT.id}
              </Badge>
              <Button
                variant="link"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="h-auto p-0 text-xs text-blue-900 underline dark:text-blue-100"
              >
                View policies
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </DismissibleBanner>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Platform Policies (v{POLICY_CURRENT.id})</DialogTitle>
            <DialogDescription>
              Review the demo terms, risk disclosures, and privacy practices.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="terms" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="terms">Demo Terms</TabsTrigger>
              <TabsTrigger value="risk">Risk Disclosure</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Lite</TabsTrigger>
            </TabsList>
            <TabsContent value="terms" className="mt-4 space-y-2">
              <h3 className="font-semibold">Demo Terms</h3>
              <div className="whitespace-pre-wrap text-sm">
                {POLICY_CURRENT.docs.termsDemo}
              </div>
            </TabsContent>
            <TabsContent value="risk" className="mt-4 space-y-2">
              <h3 className="font-semibold">Risk Disclosure</h3>
              <div className="whitespace-pre-wrap text-sm">
                {POLICY_CURRENT.docs.riskDisclosure}
              </div>
            </TabsContent>
            <TabsContent value="privacy" className="mt-4 space-y-2">
              <h3 className="font-semibold">Privacy Lite</h3>
              <div className="whitespace-pre-wrap text-sm">
                {POLICY_CURRENT.docs.privacyLite}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

