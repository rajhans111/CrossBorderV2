import type { TradeOrder } from "@setu/types";
import type { Store } from "../../store/store.js";

/** Simulates the bank webhook fired when a buyer pays: moves funds into escrow. */
export interface PaymentGateway {
  processPayment(store: Store, reference: string): TradeOrder;
}
