import { beforeEach, describe, expect, it } from "vitest";
import { Store } from "../store/store.js";
import { transitionOrder } from "./orderService.js";
import { IllegalTransitionError } from "../domain/orderStateMachine.js";

function seedBareOrder(store: Store, shippingDocsConfirmed: boolean) {
  const buyer = store.createBuyer({
    name: "Test Buyer",
    country: "Singapore",
    email: "buyer@example.com",
    contactId: "contact-1",
  });

  return store.createOrder({
    reference: "XO-TEST01",
    buyerId: buyer.id,
    product: "Test product",
    quantity: 100,
    amount: 1000,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6109.10",
    paymentTerms: "TT",
    status: "Created",
    shippingDocs: [
      { type: "packing_list", status: shippingDocsConfirmed ? "confirmed" : "pending" },
      { type: "bill_of_lading", status: shippingDocsConfirmed ? "confirmed" : "pending" },
      { type: "certificate_of_origin", status: shippingDocsConfirmed ? "confirmed" : "pending" },
      { type: "shipping_bill_leo", status: shippingDocsConfirmed ? "confirmed" : "pending" },
    ],
  });
}

describe("orderService.transitionOrder", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  it("applies a valid transition, updates the order, and appends exactly one audit event", () => {
    seedBareOrder(store, false);

    const updated = transitionOrder(store, "XO-TEST01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");

    expect(updated.status).toBe("PaymentAwaited");
    expect(store.getOrderByReference("XO-TEST01")?.status).toBe("PaymentAwaited");

    const trail = store.getAuditTrail();
    expect(trail).toHaveLength(1);
    expect(trail[0]).toMatchObject({
      event: "status.payment_awaited",
      actor: "exporter",
      entity: "TradeOrder:XO-TEST01",
      privileged: false,
    });
  });

  it("rejects an illegal transition, leaves the order unchanged, and writes no audit event", () => {
    seedBareOrder(store, false);

    expect(() =>
      transitionOrder(store, "XO-TEST01", { type: "PAYMENT_RECEIVED" }, "exporter"),
    ).toThrow(IllegalTransitionError);

    expect(store.getOrderByReference("XO-TEST01")?.status).toBe("Created");
    expect(store.getAuditTrail()).toHaveLength(0);
  });

  it("drives an order through dispute -> resolve back to its prior status", () => {
    seedBareOrder(store, false);
    transitionOrder(store, "XO-TEST01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    transitionOrder(store, "XO-TEST01", { type: "PAYMENT_RECEIVED" }, "mock_bank");

    const disputed = transitionOrder(
      store,
      "XO-TEST01",
      { type: "RAISE_DISPUTE", reason: "goods_not_received", openedBy: "buyer" },
      "buyer",
    );
    expect(disputed.status).toBe("Disputed");
    expect(disputed.disputeId).toBeDefined();

    const dispute = store.getDispute(disputed.disputeId!);
    expect(dispute).toMatchObject({ status: "Open", previousStatus: "InEscrow" });

    const resolved = transitionOrder(store, "XO-TEST01", { type: "RESOLVE_DISPUTE" }, "ops");
    expect(resolved.status).toBe("InEscrow");
    expect(resolved.disputeId).toBeUndefined();
    expect(store.getDispute(dispute!.id)?.status).toBe("Resolved");
  });

  it("drives an order through dispute -> refund", () => {
    seedBareOrder(store, false);
    transitionOrder(store, "XO-TEST01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    transitionOrder(store, "XO-TEST01", { type: "PAYMENT_RECEIVED" }, "mock_bank");
    transitionOrder(
      store,
      "XO-TEST01",
      { type: "RAISE_DISPUTE", reason: "damaged", openedBy: "buyer" },
      "buyer",
    );

    const refunded = transitionOrder(store, "XO-TEST01", { type: "REFUND" }, "ops");
    expect(refunded.status).toBe("Refunded");
    expect(refunded.disputeId).toBeDefined();
    expect(store.getDispute(refunded.disputeId!)?.status).toBe("Resolved");
  });

  it("blocks MARK_SHIPPED until all shipping docs are confirmed", () => {
    seedBareOrder(store, false);
    transitionOrder(store, "XO-TEST01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    transitionOrder(store, "XO-TEST01", { type: "PAYMENT_RECEIVED" }, "mock_bank");

    expect(() =>
      transitionOrder(store, "XO-TEST01", { type: "MARK_SHIPPED" }, "exporter"),
    ).toThrow();
    expect(store.getOrderByReference("XO-TEST01")?.status).toBe("InEscrow");
  });
});
