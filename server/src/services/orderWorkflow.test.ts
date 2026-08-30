import { beforeEach, describe, expect, it } from "vitest";
import { Store } from "../store/store.js";
import { services } from "./container.js";
import { transitionOrder } from "./orderService.js";
import { confirmDelivery, raiseDispute, receivePayment, refundOrder, resolveDispute } from "./orderWorkflow.js";

function seedReadyOrder(store: Store) {
  const virtualAccount = store.createVirtualAccount({
    currency: "SGD",
    accountNo: "SGD7788123456",
    bankName: "MAS Partner Bank (Demo)",
    swift: "XINT0SGSXXX",
    escrowBalance: 100_000,
  });
  store.createExporter({
    companyName: "Test Exports",
    gstin: "GSTIN",
    iec: "IEC",
    msmeUdyam: "UDYAM",
    city: "Tirupur",
    industry: "Textile",
    kycStatus: "Approved",
    directorName: "Test Director",
    directorPan: "AAAPT1234A",
    bankAccountNo: "demo",
    ifsc: "HDFC0001234",
    bankName: "demo",
    virtualAccountId: virtualAccount.id,
  });
  const buyer = store.createBuyer({
    name: "Test Buyer",
    country: "Singapore",
    email: "buyer@example.com",
    contactId: "contact-1",
  });
  return store.createOrder({
    reference: "XO-WF01",
    buyerId: buyer.id,
    product: "Test product",
    quantity: 10,
    amount: 40_000,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6109.10",
    paymentTerms: "TT",
    status: "Created",
    shippingDocs: [
      { type: "packing_list", status: "confirmed" },
      { type: "bill_of_lading", status: "confirmed" },
      { type: "certificate_of_origin", status: "confirmed" },
      { type: "shipping_bill_leo", status: "confirmed" },
    ],
  });
}

describe("orderWorkflow integration", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  it("drives payment -> ship -> confirm through the full definition-of-done chain", () => {
    seedReadyOrder(store);
    transitionOrder(store, "XO-WF01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    receivePayment(store, services, "XO-WF01");
    transitionOrder(store, "XO-WF01", { type: "MARK_SHIPPED" }, "exporter");

    const completed = confirmDelivery(store, services, "XO-WF01");

    expect(completed.status).toBe("Completed");
    expect(store.getEscrowPosition(completed.id)?.status).toBe("Released");
    expect(store.getFxQuote(completed.id)).toBeDefined();

    const events = store.getAuditTrail().map((e) => e.event);
    expect(events).toEqual([
      "status.payment_awaited",
      "status.in_escrow",
      "escrow.held",
      "status.shipped",
      "status.delivery_confirmed",
      "escrow.released",
      "fx.quoted",
      "status.fx_settled",
      "compliance.filed",
      "status.completed",
    ]);
  });

  it("keeps the virtual account balance net-zero across a full hold/release cycle", () => {
    seedReadyOrder(store);
    const exporter = store.getExporter()!;
    const before = store.getVirtualAccount(exporter.virtualAccountId)!.escrowBalance;

    transitionOrder(store, "XO-WF01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    receivePayment(store, services, "XO-WF01");
    transitionOrder(store, "XO-WF01", { type: "MARK_SHIPPED" }, "exporter");
    confirmDelivery(store, services, "XO-WF01");

    const after = store.getVirtualAccount(exporter.virtualAccountId)!.escrowBalance;
    expect(after).toBe(before);
  });

  it("drives dispute -> resolve back into flow, then on to completion", () => {
    seedReadyOrder(store);
    transitionOrder(store, "XO-WF01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    receivePayment(store, services, "XO-WF01");

    const disputed = raiseDispute(store, services, "XO-WF01", "goods_not_received", "buyer");
    expect(disputed.status).toBe("Disputed");
    expect(store.getEscrowPosition(disputed.id)?.status).toBe("Disputed");

    const resolved = resolveDispute(store, services, "XO-WF01");
    expect(resolved.status).toBe("InEscrow");
    expect(store.getEscrowPosition(resolved.id)?.status).toBe("Held");

    transitionOrder(store, "XO-WF01", { type: "MARK_SHIPPED" }, "exporter");
    const completed = confirmDelivery(store, services, "XO-WF01");
    expect(completed.status).toBe("Completed");
  });

  it("drives dispute -> refund and releases the held funds back out", () => {
    seedReadyOrder(store);
    const exporter = store.getExporter()!;
    const before = store.getVirtualAccount(exporter.virtualAccountId)!.escrowBalance;

    transitionOrder(store, "XO-WF01", { type: "MARK_PAYMENT_AWAITED" }, "exporter");
    receivePayment(store, services, "XO-WF01");
    raiseDispute(store, services, "XO-WF01", "damaged", "buyer");
    const refunded = refundOrder(store, services, "XO-WF01");

    expect(refunded.status).toBe("Refunded");
    expect(store.getEscrowPosition(refunded.id)?.status).toBe("Refunded");
    expect(store.getVirtualAccount(exporter.virtualAccountId)!.escrowBalance).toBe(before);
  });
});
