import { describe, expect, it } from "vitest";
import {
  applyOrderEvent,
  GuardFailedError,
  IllegalTransitionError,
} from "./orderStateMachine.js";

describe("orderStateMachine", () => {
  it("walks the full happy path from Created to Completed", () => {
    const steps: { event: Parameters<typeof applyOrderEvent>[1]; expected: string }[] = [
      { event: { type: "MARK_PAYMENT_AWAITED" }, expected: "PaymentAwaited" },
      { event: { type: "PAYMENT_RECEIVED" }, expected: "InEscrow" },
      { event: { type: "MARK_SHIPPED" }, expected: "Shipped" },
      { event: { type: "CONFIRM_DELIVERY" }, expected: "DeliveryConfirmed" },
      { event: { type: "SETTLE_FX" }, expected: "FxSettled" },
      { event: { type: "COMPLETE" }, expected: "Completed" },
    ];

    let status: Parameters<typeof applyOrderEvent>[0] = "Created";
    for (const step of steps) {
      const outcome = applyOrderEvent(status, step.event, { shippingDocsAllConfirmed: true });
      expect(outcome.nextStatus).toBe(step.expected);
      status = outcome.nextStatus;
    }
  });

  it("rejects illegal jumps that skip states", () => {
    expect(() =>
      applyOrderEvent("Created", { type: "PAYMENT_RECEIVED" }, { shippingDocsAllConfirmed: false }),
    ).toThrow(IllegalTransitionError);
  });

  it("rejects any event once an order is Completed", () => {
    expect(() =>
      applyOrderEvent("Completed", { type: "COMPLETE" }, { shippingDocsAllConfirmed: false }),
    ).toThrow(IllegalTransitionError);
  });

  it("blocks MARK_SHIPPED until all shipping docs are confirmed", () => {
    expect(() =>
      applyOrderEvent("InEscrow", { type: "MARK_SHIPPED" }, { shippingDocsAllConfirmed: false }),
    ).toThrow(GuardFailedError);
  });

  it("allows raising a dispute from InEscrow or Shipped", () => {
    const fromEscrow = applyOrderEvent(
      "InEscrow",
      { type: "RAISE_DISPUTE", reason: "goods_not_received", openedBy: "buyer" },
      { shippingDocsAllConfirmed: false },
    );
    expect(fromEscrow.nextStatus).toBe("Disputed");

    const fromShipped = applyOrderEvent(
      "Shipped",
      { type: "RAISE_DISPUTE", reason: "damaged", openedBy: "buyer" },
      { shippingDocsAllConfirmed: true },
    );
    expect(fromShipped.nextStatus).toBe("Disputed");
  });

  it("rejects raising a dispute from states outside InEscrow/Shipped", () => {
    expect(() =>
      applyOrderEvent(
        "DeliveryConfirmed",
        { type: "RAISE_DISPUTE", reason: "quality_issue", openedBy: "buyer" },
        { shippingDocsAllConfirmed: true },
      ),
    ).toThrow(IllegalTransitionError);
  });

  it("resolves a dispute back into the status it was raised from", () => {
    const outcome = applyOrderEvent(
      "Disputed",
      { type: "RESOLVE_DISPUTE" },
      { shippingDocsAllConfirmed: false, previousStatus: "Shipped" },
    );
    expect(outcome.nextStatus).toBe("Shipped");
  });

  it("rejects resolving a dispute with no recorded previous status", () => {
    expect(() =>
      applyOrderEvent("Disputed", { type: "RESOLVE_DISPUTE" }, { shippingDocsAllConfirmed: false }),
    ).toThrow(GuardFailedError);
  });

  it("allows refunding a disputed order, and rejects refunding a non-disputed one", () => {
    const outcome = applyOrderEvent(
      "Disputed",
      { type: "REFUND" },
      { shippingDocsAllConfirmed: false },
    );
    expect(outcome.nextStatus).toBe("Refunded");

    expect(() =>
      applyOrderEvent("InEscrow", { type: "REFUND" }, { shippingDocsAllConfirmed: false }),
    ).toThrow(IllegalTransitionError);
  });

  it("treats Refunded as terminal", () => {
    expect(() =>
      applyOrderEvent("Refunded", { type: "REFUND" }, { shippingDocsAllConfirmed: false }),
    ).toThrow(IllegalTransitionError);
  });
});
