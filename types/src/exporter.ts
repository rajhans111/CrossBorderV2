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
  directorName: string;
  directorPan: string;
  bankAccountNo: string;
  ifsc: string;
  bankName: string;
  virtualAccountId: string;
}
