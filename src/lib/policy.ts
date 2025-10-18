export interface PolicyVersion {
  id: string; // e.g., "v1.0"
  effective: string; // ISO date
  docs: {
    termsDemo: string; // short markdown/plaintext
    riskDisclosure: string; // default/liquidity/platform risk
    privacyLite: string; // storage, masking, retention
  };
}

export const POLICY_CURRENT: PolicyVersion = {
  id: "v1.0",
  effective: "2025-10-01",
  docs: {
    termsDemo:
      "Simulation only. No real funds. Local storage only. Not an offer. This demonstration platform is for educational and testing purposes. By accepting, you acknowledge this is not a real financial product and no actual lending or borrowing will occur.",
    riskDisclosure:
      "P2P lending carries risk of loss or delay. No guarantee of repayment. Defaults are possible. Platform may fail or become unavailable. Interest rates shown are simulated and not indicative of real market rates. In a real P2P platform, you could lose all or part of your principal. Diversification and due diligence are critical in production environments.",
    privacyLite:
      "We store minimal form data in your browser sessionStorage only. Sensitive fields like phone numbers are masked for display. No data leaves your device. No server storage. No tracking. Clear all data via the Reset button in Admin. Data is automatically cleared when you close the browser or clear site data.",
  },
};

