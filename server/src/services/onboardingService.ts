import type { Exporter, VirtualAccount } from "@setu/types";
import type { Store } from "../store/store.js";
import { NotFoundError, ValidationError } from "../errors.js";

export interface OnboardingProfile {
  companyName: string;
  gstin: string;
  iec: string;
  msmeUdyam: string;
  city: string;
  industry: string;
  directorName: string;
  directorPan: string;
  bankAccountNo: string;
  ifsc: string;
  bankName: string;
}

export interface OnboardingInput extends OnboardingProfile {
  /** One or more virtual accounts to provision — the first becomes the exporter's primary. */
  virtualAccounts: Omit<VirtualAccount, "id">[];
}

const REQUIRED_FIELDS: (keyof OnboardingProfile)[] = [
  "companyName",
  "gstin",
  "iec",
  "city",
  "industry",
  "directorName",
  "directorPan",
  "bankAccountNo",
  "ifsc",
  "bankName",
];

function assertValidProfile(input: OnboardingProfile): void {
  for (const field of REQUIRED_FIELDS) {
    if (!input[field]?.trim()) {
      throw new ValidationError(`"${field}" is required`);
    }
  }
}

/**
 * The business step this whole app is built around: an exporter completes
 * onboarding (business details, director KYC, bank account, review), and
 * that — not server boot — is what provisions their virtual account(s) and
 * links them to the exporter. KYC is auto-approved in this demo, per spec.
 */
export function completeOnboarding(store: Store, input: OnboardingInput): Exporter {
  assertValidProfile(input);
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
    directorName: input.directorName,
    directorPan: input.directorPan,
    bankAccountNo: input.bankAccountNo,
    ifsc: input.ifsc,
    bankName: input.bankName,
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

/**
 * Lets the already-onboarded demo exporter resubmit the wizard with new
 * business/director/bank details — an edit to the singleton exporter
 * profile, not a second exporter. Virtual accounts are left untouched since
 * they're already provisioned and orders/escrow are keyed off them.
 */
export function updateOnboarding(store: Store, input: OnboardingProfile): Exporter {
  assertValidProfile(input);

  const existing = store.getExporter();
  if (!existing) {
    throw new NotFoundError("No exporter has been onboarded yet");
  }

  const updated: Exporter = {
    ...existing,
    companyName: input.companyName,
    gstin: input.gstin,
    iec: input.iec,
    msmeUdyam: input.msmeUdyam,
    city: input.city,
    industry: input.industry,
    directorName: input.directorName,
    directorPan: input.directorPan,
    bankAccountNo: input.bankAccountNo,
    ifsc: input.ifsc,
    bankName: input.bankName,
  };
  store.saveExporter(updated);

  store.addAuditEvent({
    event: "onboarding.updated",
    actor: "system",
    entity: `Exporter:${updated.companyName}`,
    privileged: true,
    beforeState: { companyName: existing.companyName, gstin: existing.gstin, bankAccountNo: existing.bankAccountNo },
    afterState: { companyName: updated.companyName, gstin: updated.gstin, bankAccountNo: updated.bankAccountNo },
    evidence: "onboarding wizard resubmitted with updated business/director/bank details",
  });

  return updated;
}
