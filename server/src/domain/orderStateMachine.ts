import type { TradeOrderStatus, TradeOrderEvent } from "@setu/types";

export class OrderTransitionError extends Error {}

export class IllegalTransitionError extends OrderTransitionError {
  constructor(status: TradeOrderStatus, eventType: TradeOrderEvent["type"]) {
    super(`Cannot apply event "${eventType}" to order in status "${status}"`);
    this.name = "IllegalTransitionError";
  }
}

export class GuardFailedError extends OrderTransitionError {
  constructor(message: string) {
    super(message);
    this.name = "GuardFailedError";
  }
}

export interface TransitionContext {
  /** Required to allow MARK_SHIPPED: every shipping doc must be confirmed first. */
  shippingDocsAllConfirmed: boolean;
  /** Status the order was in before it was disputed; required to allow RESOLVE_DISPUTE. */
  previousStatus?: TradeOrderStatus;
}

export interface TransitionOutcome {
  nextStatus: TradeOrderStatus;
  auditEvent: string;
}

const NEXT_STATUS: Record<
  TradeOrderStatus,
  Partial<Record<TradeOrderEvent["type"], TradeOrderStatus>>
> = {
  Created: { MARK_PAYMENT_AWAITED: "PaymentAwaited" },
  PaymentAwaited: { PAYMENT_RECEIVED: "InEscrow" },
  InEscrow: { MARK_SHIPPED: "Shipped", RAISE_DISPUTE: "Disputed" },
  Shipped: { CONFIRM_DELIVERY: "DeliveryConfirmed", RAISE_DISPUTE: "Disputed" },
  DeliveryConfirmed: { SETTLE_FX: "FxSettled" },
  FxSettled: { COMPLETE: "Completed" },
  Completed: {},
  Disputed: { REFUND: "Refunded" },
  Refunded: {},
};

const AUDIT_EVENT_NAME: Record<TradeOrderStatus, string> = {
  Created: "status.created",
  PaymentAwaited: "status.payment_awaited",
  InEscrow: "status.in_escrow",
  Shipped: "status.shipped",
  DeliveryConfirmed: "status.delivery_confirmed",
  FxSettled: "status.fx_settled",
  Completed: "status.completed",
  Disputed: "status.disputed",
  Refunded: "status.refunded",
};

/**
 * Pure state-transition function for TradeOrder. No I/O, no side effects on
 * other entities — callers (services) are responsible for persistence and
 * writing the resulting audit event.
 */
export function applyOrderEvent(
  status: TradeOrderStatus,
  event: TradeOrderEvent,
  context: TransitionContext,
): TransitionOutcome {
  if (event.type === "RESOLVE_DISPUTE") {
    if (status !== "Disputed") {
      throw new IllegalTransitionError(status, event.type);
    }
    if (!context.previousStatus) {
      throw new GuardFailedError("No previous status recorded to resolve the dispute into");
    }
    return { nextStatus: context.previousStatus, auditEvent: "status.dispute_resolved" };
  }

  const nextStatus = NEXT_STATUS[status]?.[event.type];
  if (!nextStatus) {
    throw new IllegalTransitionError(status, event.type);
  }

  if (event.type === "MARK_SHIPPED" && !context.shippingDocsAllConfirmed) {
    throw new GuardFailedError("All shipping documents must be confirmed before marking shipped");
  }

  return { nextStatus, auditEvent: AUDIT_EVENT_NAME[nextStatus] };
}
