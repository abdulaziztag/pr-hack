"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Applicant } from "@/lib/types"
import { computeScore } from "@/lib/scoring"
import { logAudit } from "@/lib/audit"
import { maskPII } from "@/lib/safety"
import { announce } from "@/lib/announce"
import { incr } from "@/lib/analytics"
import { BorrowerKyc, saveBorrower } from "@/lib/borrower"
import { POLICY_CURRENT } from "@/lib/policy"
import { PolicyViewer } from "@/components/PolicyViewer"
import { AlertCircle } from "lucide-react"

const PURPOSES = [
  "Personal expenses",
  "Business",
  "Education",
  "Medical",
  "Home improvement",
  "Other",
]

export function IntakeForm() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [termDays, setTermDays] = useState("")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [employmentStatus, setEmploymentStatus] = useState<
    "employed" | "self" | "student" | "unemployed"
  >("employed")
  const [hasDelinquency, setHasDelinquency] = useState(false)
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [phone, setPhone] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  // KYC-lite fields
  const [fullName, setFullName] = useState("")
  const [kycPhone, setKycPhone] = useState("")
  const [citizenship, setCitizenship] = useState<string | undefined>(undefined)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptRisk, setAcceptRisk] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [termsDialogOpen, setTermsDialogOpen] = useState(false)
  const [riskDialogOpen, setRiskDialogOpen] = useState(false)
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = "Please enter a valid amount"
    } else if (amountNum < 100_000) {
      newErrors.amount = "Minimum amount is 100,000 UZS"
    } else if (amountNum > 50_000_000) {
      newErrors.amount = "Maximum amount is 50,000,000 UZS"
    }

    const termNum = parseInt(termDays, 10)
    if (!termDays || isNaN(termNum) || termNum <= 0) {
      newErrors.termDays = "Please enter a valid term"
    } else if (termNum < 5) {
      newErrors.termDays = "Minimum term is 5 days"
    } else if (termNum > 90) {
      newErrors.termDays = "Maximum term is 90 days"
    }

    const incomeNum = parseFloat(monthlyIncome)
    if (!monthlyIncome || isNaN(incomeNum) || incomeNum < 0) {
      newErrors.monthlyIncome = "Please enter a valid monthly income"
    }

    if (!phone || phone.length < 9) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!idNumber || idNumber.length < 6) {
      newErrors.idNumber = "Please enter a valid ID number"
    }

    if (!agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms"
    }

    // KYC-lite validation
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name"
    }

    if (!kycPhone || kycPhone.length < 9) {
      newErrors.kycPhone = "Please enter a valid phone number"
    }

    if (!acceptTerms || !acceptRisk || !acceptPrivacy) {
      newErrors.kycPolicy =
        "You must accept the Demo Terms, Risk Disclosure, and Privacy Lite to proceed."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const amountNum = parseFloat(amount)
    const termNum = parseInt(termDays, 10)
    const incomeNum = parseFloat(monthlyIncome)

    const { score, bucket } = computeScore({
      amount: amountNum,
      termDays: termNum,
      monthlyIncome: incomeNum,
      employmentStatus,
      hasDelinquency,
      agreeToTerms,
    })

    const applicant: Applicant = {
      amount: amountNum,
      termDays: termNum,
      monthlyIncome: incomeNum,
      employmentStatus,
      hasDelinquency,
      agreeToTerms,
      score,
      bucket,
      purpose,
      phone,
      idNumber,
    }

    // Store in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("fairlend.intake", JSON.stringify(applicant))
    }

    // Save KYC-lite
    const kycData: BorrowerKyc = {
      fullName,
      phoneMasked: maskPII(kycPhone),
      citizenship: citizenship || undefined,
      consentTermsVersion: POLICY_CURRENT.id,
      consentRiskVersion: POLICY_CURRENT.id,
      consentPrivacyVersion: POLICY_CURRENT.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    saveBorrower(kycData)

    // Log audit events
    logAudit("APPLY_SUBMIT", {
      amount: amountNum,
      termDays: termNum,
      monthlyIncome: incomeNum,
      employmentStatus,
      hasDelinquency,
      phone: maskPII(phone),
      idNumber: maskPII(idNumber),
      score,
      bucket,
    })

    logAudit("BORROWER_KYC_SAVE", {
      v: POLICY_CURRENT.id,
      fullName: maskPII(fullName),
      phone: maskPII(kycPhone),
    })

    // Announce to screen readers
    announce(
      "Application submitted. Showing eligible offers ranked by APR."
    )

    // Track analytics
    incr("apply_submits")

    // Navigate to offers
    router.push("/offers")
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Loan Application</CardTitle>
        <CardDescription>
          Fill in your details to see personalized loan offers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Loan Amount (UZS) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 1000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            {errors.amount && (
              <p id="amount-error" className="text-sm text-destructive">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Term */}
          <div className="space-y-2">
            <Label htmlFor="termDays">
              Term (days) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="termDays"
              type="number"
              placeholder="e.g., 30"
              value={termDays}
              onChange={(e) => setTermDays(e.target.value)}
              aria-invalid={!!errors.termDays}
              aria-describedby={errors.termDays ? "term-error" : undefined}
            />
            {errors.termDays && (
              <p id="term-error" className="text-sm text-destructive">
                {errors.termDays}
              </p>
            )}
          </div>

          {/* Monthly Income */}
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">
              Monthly Income (UZS) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="e.g., 5000000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              aria-invalid={!!errors.monthlyIncome}
              aria-describedby={errors.monthlyIncome ? "income-error" : undefined}
            />
            {errors.monthlyIncome && (
              <p id="income-error" className="text-sm text-destructive">
                {errors.monthlyIncome}
              </p>
            )}
          </div>

          {/* Employment Status */}
          <div className="space-y-2">
            <Label htmlFor="employmentStatus">
              Employment Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={employmentStatus}
              onValueChange={(value) =>
                setEmploymentStatus(
                  value as "employed" | "self" | "student" | "unemployed"
                )
              }
            >
              <SelectTrigger id="employmentStatus">
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="self">Self-employed</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Has Delinquency */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasDelinquency"
              checked={hasDelinquency}
              onCheckedChange={(checked) =>
                setHasDelinquency(checked === true)
              }
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="hasDelinquency" className="cursor-pointer">
                I have a history of late repayment in the last 12 months
              </Label>
              <p className="text-sm text-muted-foreground">
                Checking this may affect your eligibility
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error phone-help" : "phone-help"}
            />
            <p id="phone-help" className="text-xs text-muted-foreground">
              KYC is simulated; no documents are uploaded.
            </p>
            {errors.phone && (
              <p id="phone-error" className="text-sm text-destructive">
                {errors.phone}
              </p>
            )}
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <Label htmlFor="idNumber">
              ID Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="idNumber"
              type="text"
              placeholder="AA1234567"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              aria-invalid={!!errors.idNumber}
              aria-describedby={errors.idNumber ? "id-error" : undefined}
            />
            {errors.idNumber && (
              <p id="id-error" className="text-sm text-destructive">
                {errors.idNumber}
              </p>
            )}
          </div>

          {/* Light KYC Notice */}
          <div className="rounded-lg bg-muted p-4 text-sm">
            <h3 className="mb-2 font-semibold">Light KYC & Scoring</h3>
            <p className="text-muted-foreground">
              We&apos;ll compute a mock credit score (300-900) based on your
              inputs. No document upload required for this demo.
            </p>
          </div>

          <Separator className="my-6" />

          {/* KYC-lite Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">
              KYC-lite (Simulation Only){" "}
              <span className="text-destructive">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              In production, this would verify identity. Here we only collect
              minimal info for demo purposes.
            </p>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-sm text-destructive">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* KYC Phone */}
            <div className="space-y-2">
              <Label htmlFor="kycPhone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kycPhone"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={kycPhone}
                onChange={(e) => setKycPhone(e.target.value)}
                aria-invalid={!!errors.kycPhone}
                aria-describedby={errors.kycPhone ? "kycPhone-error" : undefined}
              />
              <p className="text-xs text-muted-foreground">
                Will be masked for display (e.g., +998 90 XXX XX 67).
              </p>
              {errors.kycPhone && (
                <p id="kycPhone-error" className="text-sm text-destructive">
                  {errors.kycPhone}
                </p>
              )}
            </div>

            {/* Citizenship (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="citizenship">Citizenship (Optional)</Label>
              <Select value={citizenship ?? undefined} onValueChange={(v) => setCitizenship(v)}>
                <SelectTrigger id="citizenship">
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZ">Uzbekistan</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Policy Acknowledgments */}
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Policy Acknowledgments <span className="text-destructive">*</span>
              </p>

              {/* Terms */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setAcceptTerms(checked === true)
                    }
                  />
                  <Label htmlFor="acceptTerms" className="cursor-pointer text-sm">
                    I accept the Demo Terms (v{POLICY_CURRENT.id})
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
                    onCheckedChange={(checked) => setAcceptRisk(checked === true)}
                  />
                  <Label htmlFor="acceptRisk" className="cursor-pointer text-sm">
                    I acknowledge Risk Disclosure (v{POLICY_CURRENT.id})
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

              {/* Privacy */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={acceptPrivacy}
                    onCheckedChange={(checked) =>
                      setAcceptPrivacy(checked === true)
                    }
                  />
                  <Label
                    htmlFor="acceptPrivacy"
                    className="cursor-pointer text-sm"
                  >
                    I accept Privacy Lite (v{POLICY_CURRENT.id})
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

              {errors.kycPolicy && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{errors.kycPolicy}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
              aria-invalid={!!errors.agreeToTerms}
              aria-describedby={errors.agreeToTerms ? "terms-error" : undefined}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm">
              I agree to the terms and conditions and privacy policy{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p id="terms-error" className="text-sm text-destructive">
              {errors.agreeToTerms}
            </p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg">
            See Offers
          </Button>
        </form>
      </CardContent>

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
    </Card>
  )
}
