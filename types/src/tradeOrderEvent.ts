import type { DisputeReason } from "./dispute.js";

export type TradeOrderEvent =
  | { type: "MARK_PAYMENT_AWAITED" }
  | { type: "PAYMENT_RECEIVED" }
  | { type: "MARK_SHIPPED" }
  | { type: "CONFIRM_DELIVERY" }
  | { type: "SETTLE_FX" }
  | { type: "COMPLETE" }
  | { type: "RAISE_DISPUTE"; reason: DisputeReason; openedBy: "exporter" | "buyer" }
  | { type: "RESOLVE_DISPUTE" }
  | { type: "REFUND" };
