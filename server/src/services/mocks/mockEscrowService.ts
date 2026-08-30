import type { Currency, EscrowPosition, TradeOrder } from "@setu/types";
import type { Store } from "../../store/store.js";
import type { EscrowServiceInterface } from "../interfaces/escrowService.js";

function withAppendedEvent(position: EscrowPosition, event: string): EscrowPosition {
  return {
    ...position,
    events: [...position.events, { when: new Date().toISOString(), event }],
  };
}

function adjustVirtualAccountBalance(store: Store, currency: Currency, delta: number): void {
  const account = store.getVirtualAccountByCurrency(currency);
  if (!account) return;
  store.saveVirtualAccount({ ...account, escrowBalance: account.escrowBalance + delta });
}

function requireEscrowPosition(store: Store, order: TradeOrder): EscrowPosition {
  const position = store.getEscrowPosition(order.id);
  if (!position) {
    throw new Error(`No escrow position exists for order "${order.reference}"`);
  }
  return position;
}

export const mockEscrowService: EscrowServiceInterface = {
  hold(store, order) {
    const position: EscrowPosition = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "Held",
      events: [{ when: new Date().toISOString(), event: "escrow.held" }],
    };
    store.saveEscrowPosition(position);
    adjustVirtualAccountBalance(store, order.currency, order.amount);
    store.addAuditEvent({
      event: "escrow.held",
      actor: "system",
      entity: `TradeOrder:${order.reference}`,
      privileged: false,
    });
    return position;
  },

  release(store, order) {
    const existing = requireEscrowPosition(store, order);
    const updated: EscrowPosition = { ...withAppendedEvent(existing, "escrow.released"), status: "Released" };
    store.saveEscrowPosition(updated);
    adjustVirtualAccountBalance(store, existing.currency, -existing.amount);
    store.addAuditEvent({
      event: "escrow.released",
      actor: "system",
      entity: `TradeOrder:${order.reference}`,
      privileged: false,
    });
    return updated;
  },

  refund(store, order) {
    const existing = requireEscrowPosition(store, order);
    const updated: EscrowPosition = { ...withAppendedEvent(existing, "escrow.refunded"), status: "Refunded" };
    store.saveEscrowPosition(updated);
    adjustVirtualAccountBalance(store, existing.currency, -existing.amount);
    store.addAuditEvent({
      event: "escrow.refunded",
      actor: "system",
      entity: `TradeOrder:${order.reference}`,
      privileged: false,
    });
    return updated;
  },

  markDisputed(store, order) {
    const existing = requireEscrowPosition(store, order);
    const updated: EscrowPosition = { ...withAppendedEvent(existing, "escrow.disputed"), status: "Disputed" };
    store.saveEscrowPosition(updated);
    store.addAuditEvent({
      event: "escrow.disputed",
      actor: "system",
      entity: `TradeOrder:${order.reference}`,
      privileged: false,
    });
    return updated;
  },

  resolveDispute(store, order) {
    const existing = requireEscrowPosition(store, order);
    const updated: EscrowPosition = { ...withAppendedEvent(existing, "escrow.resolved"), status: "Held" };
    store.saveEscrowPosition(updated);
    store.addAuditEvent({
      event: "escrow.resolved",
      actor: "system",
      entity: `TradeOrder:${order.reference}`,
      privileged: false,
    });
    return updated;
  },
};
