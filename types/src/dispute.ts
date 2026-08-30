import type { TradeOrderStatus } from "./orderStatus.js";

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
  /** Status the order was in immediately before this dispute was raised, so a
   * resolved dispute can put the order back into its place in the main flow. */
  previousStatus: TradeOrderStatus;
}
