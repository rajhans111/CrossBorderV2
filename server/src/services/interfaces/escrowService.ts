import type { EscrowPosition, TradeOrder } from "@setu/types";
import type { Store } from "../../store/store.js";

/** hold -> condition check -> release / refund / dispute, with an immutable event log. */
export interface EscrowServiceInterface {
  hold(store: Store, order: TradeOrder): EscrowPosition;
  release(store: Store, order: TradeOrder): EscrowPosition;
  refund(store: Store, order: TradeOrder): EscrowPosition;
  markDisputed(store: Store, order: TradeOrder): EscrowPosition;
  resolveDispute(store: Store, order: TradeOrder): EscrowPosition;
}
