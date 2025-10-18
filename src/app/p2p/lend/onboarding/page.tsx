"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { P2PBreadcrumbs } from "@/components/p2p/P2PBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  readProfile,
  saveProfile,
  ensureWallet,
  LenderProfile,
} from "@/lib/lender";
import { maskPII } from "@/lib/safety";
import { writeAudit, AuditEvent } from "@/lib/audit";
import { POLICY_CURRENT } from "@/lib/policy";
import { PolicyViewer } from "@/components/PolicyViewer";

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptRisk, setAcceptRisk] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    // Validation
    const errs: string[] = [];
    if (!fullName.trim()) errs.push("Full name is required");
    if (!phone.trim()) errs.push("Phone is required");
    if (!acceptTerms)
      errs.push(`Demo Terms (${POLICY_CURRENT.id}) acceptance is required`);
    if (!acceptRisk)
      errs.push(`Risk Disclosure (${POLICY_CURRENT.id}) acknowledgment is required`);
    if (!acceptPrivacy)
      errs.push(`Privacy Lite (${POLICY_CURRENT.id}) acceptance is required`);

    if (errs.length > 0) {
      setErrors(errs);
      setLoading(false);
      return;
    }

    // Mask phone
    const phoneMasked = maskPII(phone);

    // Create or update profile
    const existing = readProfile();
    const profile: LenderProfile = {
      id:
        existing?.id ||
        `lp_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`,
      fullName: fullName.trim(),
      phoneMasked,
      nationality: nationality.trim() || undefined,
      riskAcknowledged: acceptRisk,
      termsAccepted: acceptTerms,
      policy: {
        terms: POLICY_CURRENT.id,
        risk: POLICY_CURRENT.id,
        privacy: POLICY_CURRENT.id,
      },
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    saveProfile(profile);
    ensureWallet(profile.id);

    // Audit log
    const auditEvent: AuditEvent = {
      id: `ae_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      t: Date.now(),
      type: "LENDER_POLICY_ACCEPT",
      payload: {
        id: profile.id,
        v: POLICY_CURRENT.id,
        fullName: maskPII(fullName),
        phone: maskPII(phone),
      },
    };
    writeAudit([auditEvent]);

    // Route to wallet
    setLoading(false);
    router.push("/p2p/wallet");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/50 py-12" id="main-content">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <P2PBreadcrumbs trail="lend" />

          <h1 className="mb-6 text-3xl font-bold sm:text-4xl">
            Become a Lender — Onboarding
          </h1>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Simulation only.</strong> No real funds or networking.
              For demo purposes.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lender Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    aria-required="true"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    required
                    aria-required="true"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your phone will be masked for privacy.
                  </p>
                </div>

                {/* Nationality (optional) */}
                <div>
                  <Label htmlFor="nationality">Nationality (optional)</Label>
                  <Input
                    id="nationality"
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Uzbekistan"
                  />
                </div>

                <Separator />

                {/* Policy Acknowledgments */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Policy Acknowledgments <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review and accept all policies to proceed. Click &quot;View&quot; to read
                    each document.
                  </p>

                  {/* Demo Terms */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) =>
                          setAcceptTerms(checked === true)
                        }
                        aria-required="true"
                      />
                      <Label htmlFor="acceptTerms" className="cursor-pointer">
                        I accept the <strong>Demo Terms</strong> (v
                        {POLICY_CURRENT.id})
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setTermsDialogOpen(true)}
                      className="h-auto p-0 text-xs"
                    >
                      View
                    </Button>
                  </div>

                  {/* Risk Disclosure */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptRisk"
                        checked={acceptRisk}
                        onCheckedChange={(checked) =>
                          setAcceptRisk(checked === true)
                        }
                        aria-required="true"
                      />
                      <Label htmlFor="acceptRisk" className="cursor-pointer">
                        I acknowledge <strong>Risk Disclosure</strong> (v
                        {POLICY_CURRENT.id})
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setRiskDialogOpen(true)}
                      className="h-auto p-0 text-xs"
                    >
                      View
                    </Button>
                  </div>

                  {/* Privacy Lite */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptPrivacy"
                        checked={acceptPrivacy}
                        onCheckedChange={(checked) =>
                          setAcceptPrivacy(checked === true)
                        }
                        aria-required="true"
                      />
                      <Label htmlFor="acceptPrivacy" className="cursor-pointer">
                        I accept <strong>Privacy Lite</strong> (v
                        {POLICY_CURRENT.id})
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setPrivacyDialogOpen(true)}
                      className="h-auto p-0 text-xs"
                    >
                      View
                    </Button>
                  </div>
                </div>

                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save & Continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/p2p/lend")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                What would be regulated in production?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                <li>
                  <strong>Identity verification (KYC/AML)</strong>: Full
                  passport/ID scan, liveness check, address proof
                </li>
                <li>
                  <strong>Source of funds</strong>: Documentation proving origin
                  of lender capital
                </li>
                <li>
                  <strong>Risk profiling</strong>: Financial suitability
                  assessment, loss tolerance questionnaire
                </li>
                <li>
                  <strong>Disclosures</strong>: Detailed risk warnings,
                  platform fees, complaint procedures
                </li>
                <li>
                  <strong>Tax reporting</strong>: Annual statements, withholding
                  for residents
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Policy Dialogs */}
      <PolicyViewer
        open={termsDialogOpen}
        onOpenChange={setTermsDialogOpen}
        title="Demo Terms"
        text={POLICY_CURRENT.docs.termsDemo}
        onAccept={() => setAcceptTerms(true)}
      />
      <PolicyViewer
        open={riskDialogOpen}
        onOpenChange={setRiskDialogOpen}
        title="Risk Disclosure"
        text={POLICY_CURRENT.docs.riskDisclosure}
        onAccept={() => setAcceptRisk(true)}
      />
      <PolicyViewer
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
        title="Privacy Lite"
        text={POLICY_CURRENT.docs.privacyLite}
        onAccept={() => setAcceptPrivacy(true)}
      />
    </div>
  );
}

