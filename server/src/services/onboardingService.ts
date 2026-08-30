import { CURRENCIES, type Currency, type Exporter, type VirtualAccount } from "@setu/types";
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
  /** Currency the exporter wants to settle in — drives which virtual account gets linked as primary. */
  settlementCurrency: Currency;
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
  if (!CURRENCIES.includes(input.settlementCurrency)) {
    throw new ValidationError(`"settlementCurrency" must be one of ${CURRENCIES.join(", ")}`);
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
  const primaryAccount =
    createdAccounts.find((a) => a.currency === input.settlementCurrency) ?? createdAccounts[0]!;

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

function demoAccountNoFor(currency: Currency): string {
  return `${currency}${Date.now().toString().slice(-10)}`;
}

/**
 * Lets the already-onboarded demo exporter resubmit the wizard with new
 * business/director/bank details — an edit to the singleton exporter
 * profile, not a second exporter (this is a single-tenant demo: trade
 * orders/escrow are all scoped to "the" exporter). Every resubmission still
 * provisions a virtual account for the chosen settlement currency and links
 * it as primary, per the same "onboarding creates and links the virtual
 * account" rule the initial signup follows. It's a find-or-create, not a
 * blind create: escrow settlement looks up the account for an order's
 * currency by currency (Store.getVirtualAccountByCurrency), so minting a
 * second account in a currency that already holds funds would orphan that
 * balance. Re-onboarding into an already-provisioned currency just re-links
 * the existing one; a genuinely new currency gets a fresh account.
 */
export function updateOnboarding(store: Store, input: OnboardingProfile): Exporter {
  assertValidProfile(input);

  const existing = store.getExporter();
  if (!existing) {
    throw new NotFoundError("No exporter has been onboarded yet");
  }

  let virtualAccount = store.getVirtualAccountByCurrency(input.settlementCurrency);
  const createdNewAccount = !virtualAccount;
  if (!virtualAccount) {
    virtualAccount = store.createVirtualAccount({
      currency: input.settlementCurrency,
      accountNo: demoAccountNoFor(input.settlementCurrency),
      bankName: `${input.settlementCurrency} Partner Bank (Demo)`,
      swift: `XINT0${input.settlementCurrency}XXX`,
      escrowBalance: 0,
    });
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
    virtualAccountId: virtualAccount.id,
  };
  store.saveExporter(updated);

  store.addAuditEvent({
    event: "onboarding.updated",
    actor: "system",
    entity: `Exporter:${updated.companyName}`,
    privileged: true,
    beforeState: { companyName: existing.companyName, gstin: existing.gstin, bankAccountNo: existing.bankAccountNo },
    afterState: {
      companyName: updated.companyName,
      gstin: updated.gstin,
      bankAccountNo: updated.bankAccountNo,
      virtualAccount: `${virtualAccount.currency}:${virtualAccount.accountNo}`,
    },
    evidence: createdNewAccount
      ? `onboarding wizard resubmitted — provisioned a new ${input.settlementCurrency} virtual account and linked it as primary`
      : `onboarding wizard resubmitted — linked the existing ${input.settlementCurrency} virtual account as primary`,
  });

  return updated;
}
