"use client";

import { useState, useEffect } from "react";
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs";
import { LenderGuard } from "@/components/p2p/LenderGuard";
import { OfferForm } from "@/components/p2p/OfferForm";
import { OfferRow } from "@/components/p2p/OfferRow";
import { OfferEditDialog } from "@/components/p2p/OfferEditDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Plus } from "lucide-react";
import {
  LenderOffer,
  listOffers,
  createOffer,
  updateOffer,
  setStatus,
  cancelOffer,
  getOffer,
} from "@/lib/lenderOffers";
import { writeAudit, AuditEvent } from "@/lib/audit";
import { incr } from "@/lib/analytics";
import Link from "next/link";

export default function OffersPage() {
  const [offers, setOffers] = useState<LenderOffer[]>([]);
  const [activeTab, setActiveTab] = useState("create");
  const [editingOffer, setEditingOffer] = useState<LenderOffer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    refreshOffers();
    // Set tab based on hash
    const hash = window.location.hash;
    if (hash === "#new") {
      setActiveTab("create");
    } else if (hash === "#manage") {
      setActiveTab("manage");
    }
  }, []);

  const refreshOffers = () => {
    const allOffers = listOffers();
    // Auto-mark FULLY_ALLOCATED if needed
    allOffers.forEach((o) => {
      if (o.status === "ACTIVE" && o.amount - o.allocated <= 0) {
        setStatus(o.id, "FULLY_ALLOCATED");
      }
    });
    setOffers(listOffers());
  };

  const handleCreateOffer = (offerInput: Omit<LenderOffer, "id" | "createdAt" | "updatedAt" | "allocated" | "status">) => {
    const offer = createOffer(offerInput);

    // Audit log
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "LEND_OFFER_CREATE",
      payload: {
        id: offer.id,
        amount: offer.amount,
        dailyRatePct: offer.targetDailyRatePct,
        buckets: offer.allowBuckets,
      },
    };
    writeAudit([auditEvent]);
    incr("p2p_posts");

    refreshOffers();
    setActiveTab("manage");
  };

  const handlePause = (id: string) => {
    setStatus(id, "PAUSED");
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "LEND_OFFER_STATUS",
      payload: { id, status: "PAUSED" },
    };
    writeAudit([auditEvent]);
    refreshOffers();
  };

  const handleResume = (id: string) => {
    setStatus(id, "ACTIVE");
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "LEND_OFFER_STATUS",
      payload: { id, status: "ACTIVE" },
    };
    writeAudit([auditEvent]);
    refreshOffers();
  };

  const handleCancel = (id: string) => {
    if (!confirm("Are you sure you want to cancel this offer? This action cannot be undone.")) {
      return;
    }
    cancelOffer(id);
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "LEND_OFFER_CANCEL",
      payload: { id },
    };
    writeAudit([auditEvent]);
    refreshOffers();
  };

  const handleEdit = (id: string) => {
    const offer = getOffer(id);
    if (offer) {
      setEditingOffer(offer);
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = (id: string, updates: Partial<LenderOffer>) => {
    updateOffer(id, updates);
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "LEND_OFFER_EDIT",
      payload: { id },
    };
    writeAudit([auditEvent]);
    refreshOffers();
  };

  const statusCounts = {
    ACTIVE: offers.filter((o) => o.status === "ACTIVE").length,
    PAUSED: offers.filter((o) => o.status === "PAUSED").length,
    CANCELLED: offers.filter((o) => o.status === "CANCELLED").length,
    FULLY_ALLOCATED: offers.filter((o) => o.status === "FULLY_ALLOCATED").length,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/50 py-12" id="main-content">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <P2PBreadcrumbs trail="lend" />

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
                Your Funding Offers
              </h1>
              <p className="text-muted-foreground">
                Create and manage lending offers for borrowers
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              Simulation Only
            </Badge>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Simulation only.</strong> All offers and matching are
              simulated. No real funds or networking.
            </AlertDescription>
          </Alert>

          <LenderGuard>
            {/* Summary Cards */}
            {offers.length > 0 && (
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{statusCounts.ACTIVE}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Paused
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{statusCounts.PAUSED}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Fully Allocated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{statusCounts.FULLY_ALLOCATED}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Cancelled
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{statusCounts.CANCELLED}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Offer</TabsTrigger>
                <TabsTrigger value="manage">Manage Offers</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Funding Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OfferForm onSubmit={handleCreateOffer} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manage" className="mt-6">
                {offers.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                      <Plus className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                      <h3 className="text-xl font-semibold">No Offers Yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Create your first funding offer to start lending to
                        borrowers on the platform.
                      </p>
                      <Button onClick={() => setActiveTab("create")}>
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Create Your First Offer
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Offers ({offers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableCaption className="sr-only">
                            Your funding offers
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Status</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Allocated</TableHead>
                              <TableHead>Capacity</TableHead>
                              <TableHead>Term</TableHead>
                              <TableHead>Rate</TableHead>
                              <TableHead>Max/Borrower</TableHead>
                              <TableHead>Buckets</TableHead>
                              <TableHead>Updated</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {offers.map((offer) => (
                              <OfferRow
                                key={offer.id}
                                offer={offer}
                                onPause={handlePause}
                                onResume={handleResume}
                                onCancel={handleCancel}
                                onEdit={handleEdit}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>
                          <strong>Tip:</strong> If capacity is 0, please{" "}
                          <Link href="/p2p/wallet" className="underline font-semibold">
                            top up your wallet
                          </Link>{" "}
                          to enable allocations.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </LenderGuard>
        </div>
      </main>

      <OfferEditDialog
        offer={editingOffer}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingOffer(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

