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
  let evidence: string | undefined;

  if (event.type === "RAISE_DISPUTE") {
    const dispute = store.createDispute({
      orderId: order.id,
      reason: event.reason,
      status: "Open",
      openedBy: event.openedBy,
      previousStatus: order.status,
    });
    disputeId = dispute.id;
    evidence = `dispute reason: ${event.reason}, opened by ${event.openedBy}`;
  } else if (event.type === "RESOLVE_DISPUTE" || event.type === "REFUND") {
    if (activeDispute) {
      store.updateDispute({ ...activeDispute, status: "Resolved" });
      evidence = `resolves dispute ${activeDispute.id} (${activeDispute.reason})`;
    }
    if (event.type === "RESOLVE_DISPUTE") {
      disputeId = undefined;
    }
  } else if (event.type === "MARK_SHIPPED") {
    evidence = `all shipping documents confirmed: ${order.shippingDocs.map((d) => d.type).join(", ")}`;
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
    beforeState: { status: order.status },
    afterState: { status: updatedOrder.status },
    evidence,
  });

  return updatedOrder;
}
