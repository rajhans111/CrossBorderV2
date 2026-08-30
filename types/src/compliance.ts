export type ComplianceArtefactType = "EDPMS" | "FIRC" | "eBRC";
export type ComplianceArtefactStatus =
  | "Pending Ad Bank Ack"
  | "Filed"
  | "Issued";

export interface ComplianceArtefact {
  id: string;
  orderId: string;
  type: ComplianceArtefactType;
  status: ComplianceArtefactStatus;
}
