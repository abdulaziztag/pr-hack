import { readProfile } from "./lender";
import { POLICY_CURRENT } from "./policy";

export function isLenderReady(): boolean {
  const p = readProfile();
  return !!(
    p &&
    p.riskAcknowledged &&
    p.termsAccepted &&
    p.policy?.terms === POLICY_CURRENT.id &&
    p.policy?.risk === POLICY_CURRENT.id &&
    p.policy?.privacy === POLICY_CURRENT.id
  );
}

