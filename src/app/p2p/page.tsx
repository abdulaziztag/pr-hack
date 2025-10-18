"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs"
import { BorrowIntro } from "@/components/p2p/BorrowIntro"
import { LendIntro } from "@/components/p2p/LendIntro"
import RequireAuth from "@/components/auth/RequireAuth"

export default function P2PHubPage() {
  const [activeTab, setActiveTab] = useState<"borrow" | "lend">("borrow")

  return (
    // eslint-disable-next-line jsx-a11y/aria-role
    <RequireAuth role="user">
    <div className="py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <P2PBreadcrumbs />

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
                P2P — Borrow & Lend
              </h1>
              <p className="text-muted-foreground">
                Peer-to-peer lending platform simulation
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              Simulation Only
            </Badge>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Simulation only.</strong> No real funds or networking. For
              demo purposes.
            </AlertDescription>
          </Alert>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "borrow" | "lend")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="borrow">Borrow</TabsTrigger>
              <TabsTrigger value="lend">Lend</TabsTrigger>
            </TabsList>

            <TabsContent value="borrow" className="mt-6">
              <BorrowIntro />
            </TabsContent>

            <TabsContent value="lend" className="mt-6">
              <LendIntro />
            </TabsContent>
          </Tabs>
      </div>
    </div>
    </RequireAuth>
  )
}

