import type { AuditActor, TradeOrder, TradeOrderEvent } from "@setu/types";
import type { Store } from "../store/store.js";
import { applyOrderEvent } from "../domain/orderStateMachine.js";

/**
 * The only place allowed to mutate TradeOrder.status. Runs the event through
 * the state machine, updates the order and any linked Dispute, and always
 * writes an AuditEvent — no direct status mutation elsewhere.
 */
export function transitionOrder(
  store: Store,
  reference: string,
  event: TradeOrderEvent,
  actor: AuditActor,
): TradeOrder {
  const order = store.getOrderByReference(reference);
  if (!order) {
    throw new Error(`No trade order with reference "${reference}"`);
  }

  const activeDispute = order.disputeId ? store.getDispute(order.disputeId) : undefined;
  const shippingDocsAllConfirmed =
    order.shippingDocs.length > 0 && order.shippingDocs.every((doc) => doc.status === "confirmed");

  const outcome = applyOrderEvent(order.status, event, {
    shippingDocsAllConfirmed,
    previousStatus: activeDispute?.previousStatus,
  });

  let disputeId = order.disputeId;

  if (event.type === "RAISE_DISPUTE") {
    const dispute = store.createDispute({
      orderId: order.id,
      reason: event.reason,
      status: "Open",
      openedBy: event.openedBy,
      previousStatus: order.status,
    });
    disputeId = dispute.id;
  } else if (event.type === "RESOLVE_DISPUTE" || event.type === "REFUND") {
    if (activeDispute) {
      store.updateDispute({ ...activeDispute, status: "Resolved" });
    }
    if (event.type === "RESOLVE_DISPUTE") {
      disputeId = undefined;
    }
  }

  const updatedOrder: TradeOrder = {
    ...order,
    status: outcome.nextStatus,
    updatedAt: new Date().toISOString(),
    disputeId,
  };

  store.saveOrder(updatedOrder);
  store.addAuditEvent({
    event: outcome.auditEvent,
    actor,
    entity: `TradeOrder:${updatedOrder.reference}`,
    privileged: false,
  });

  return updatedOrder;
}
