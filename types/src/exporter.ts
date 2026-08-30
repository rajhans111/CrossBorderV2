export type KycStatus = "Pending" | "Approved" | "Rejected";

export interface Exporter {
  id: string;
  companyName: string;
  gstin: string;
  iec: string;
  msmeUdyam: string;
  city: string;
  industry: string;
  kycStatus: KycStatus;
  linkedBankAccount: string;
  virtualAccountId: string;
}
