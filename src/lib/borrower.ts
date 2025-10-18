export interface BorrowerKyc {
  fullName: string;
  phoneMasked: string;
  citizenship?: string;
  consentTermsVersion: string | null; // POLICY_CURRENT.id when accepted
  consentRiskVersion: string | null;
  consentPrivacyVersion: string | null;
  createdAt: number;
  updatedAt: number;
}

const K = "fairlend.borrower.kyc";

export function readBorrower(): BorrowerKyc | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(K) || "null");
  } catch {
    return null;
  }
}

export function saveBorrower(b: BorrowerKyc) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(K, JSON.stringify(b));
}

