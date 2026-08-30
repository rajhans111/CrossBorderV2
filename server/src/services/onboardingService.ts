import type { Exporter, VirtualAccount } from "@setu/types";
import type { Store } from "../store/store.js";
import { ValidationError } from "../errors.js";

export interface OnboardingInput {
  companyName: string;
  gstin: string;
  iec: string;
  msmeUdyam: string;
  city: string;
  industry: string;
  linkedBankAccount: string;
  /** One or more virtual accounts to provision — the first becomes the exporter's primary. */
  virtualAccounts: Omit<VirtualAccount, "id">[];
}

/**
 * The business step this whole app is built around: an exporter completes
 * onboarding (business details, director KYC, bank account, review), and
 * that — not server boot — is what provisions their virtual account(s) and
 * links them to the exporter. KYC is auto-approved in this demo, per spec.
 */
export function completeOnboarding(store: Store, input: OnboardingInput): Exporter {
  if (input.virtualAccounts.length === 0) {
    throw new ValidationError("Onboarding requires at least one virtual account to provision");
  }

  const createdAccounts = input.virtualAccounts.map((account) => store.createVirtualAccount(account));
  const primaryAccount = createdAccounts[0]!;

  const exporter = store.createExporter({
    companyName: input.companyName,
    gstin: input.gstin,
    iec: input.iec,
    msmeUdyam: input.msmeUdyam,
    city: input.city,
    industry: input.industry,
    kycStatus: "Approved",
    linkedBankAccount: input.linkedBankAccount,
    virtualAccountId: primaryAccount.id,
  });

  store.addAuditEvent({
    event: "onboarding.completed",
    actor: "system",
    entity: `Exporter:${exporter.companyName}`,
    privileged: true,
    beforeState: { kycStatus: "Pending", virtualAccounts: [] },
    afterState: {
      kycStatus: "Approved",
      virtualAccounts: createdAccounts.map((a) => `${a.currency}:${a.accountNo}`),
    },
    evidence: "onboarding wizard completed — business, director KYC, and bank account steps confirmed",
  });

  return exporter;
}
