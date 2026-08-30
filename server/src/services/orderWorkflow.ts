import type { DisputeReason, TradeOrder } from "@setu/types";
import type { Store } from "../store/store.js";
import type { Services } from "./container.js";
import { transitionOrder } from "./orderService.js";

/**
 * Buyer confirms delivery -> escrow releases -> FX settles -> compliance
 * artefacts are filed -> order Completed. Chained here so every step lands
 * in the audit trail from a single buyer action, per the product's
 * definition of done.
 */
export function confirmDelivery(store: Store, services: Services, reference: string): TradeOrder {
  const confirmed = transitionOrder(store, reference, { type: "CONFIRM_DELIVERY" }, "buyer");
  services.escrowService.release(store, confirmed);

  const quote = services.fxService.quote(confirmed.amountSgd);
  store.saveFxQuote(confirmed.id, quote);
  store.addAuditEvent({
    event: "fx.quoted",
    actor: "system",
    entity: `TradeOrder:${confirmed.reference}`,
    privileged: false,
  });

  const settled = transitionOrder(store, reference, { type: "SETTLE_FX" }, "system");
  services.complianceService.fileArtefacts(store, settled);
  const completed = transitionOrder(store, reference, { type: "COMPLETE" }, "system");

  services.notifier.notify(
    `Order ${reference} completed — INR ${quote.netInr.toFixed(2)} credited (saved ₹${quote.savedVsBankInr.toFixed(2)} vs. bank)`,
  );

  return completed;
}

export function raiseDispute(
  store: Store,
  services: Services,
  reference: string,
  reason: DisputeReason,
  openedBy: "exporter" | "buyer",
): TradeOrder {
  const disputed = transitionOrder(store, reference, { type: "RAISE_DISPUTE", reason, openedBy }, openedBy);
  services.escrowService.markDisputed(store, disputed);
  return disputed;
}

export function resolveDispute(store: Store, services: Services, reference: string): TradeOrder {
  const resolved = transitionOrder(store, reference, { type: "RESOLVE_DISPUTE" }, "ops");
  services.escrowService.resolveDispute(store, resolved);
  return resolved;
}

export function refundOrder(store: Store, services: Services, reference: string): TradeOrder {
  const refunded = transitionOrder(store, reference, { type: "REFUND" }, "ops");
  services.escrowService.refund(store, refunded);
  return refunded;
}

export function receivePayment(store: Store, services: Services, reference: string): TradeOrder {
  return services.paymentGateway.processPayment(store, reference);
}
