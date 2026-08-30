export type DisputeReason =
  | "goods_not_received"
  | "damaged"
  | "quantity_mismatch"
  | "quality_issue";

export type DisputeStatus = "Open" | "Resolved";

export interface Dispute {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  openedBy: "exporter" | "buyer";
}
