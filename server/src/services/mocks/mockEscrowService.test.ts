import { beforeEach, describe, expect, it } from "vitest";
import { Store } from "../../store/store.js";
import { mockEscrowService } from "./mockEscrowService.js";
import type { TradeOrder } from "@setu/types";

describe("mockEscrowService", () => {
  let store: Store;
  let order: TradeOrder;

  beforeEach(() => {
    store = new Store();
    const virtualAccount = store.createVirtualAccount({
      accountNo: "SGD7788123456",
      bankName: "MAS Partner Bank (Demo)",
      swift: "XINT0SGSXXX",
      escrowBalanceSgd: 100_000,
    });
    store.createExporter({
      companyName: "Test Exports",
      gstin: "GSTIN",
      iec: "IEC",
      msmeUdyam: "UDYAM",
      city: "Tirupur",
      industry: "Textile",
      kycStatus: "Approved",
      linkedBankAccount: "demo",
      virtualAccountId: virtualAccount.id,
    });
    const buyer = store.createBuyer({
      name: "Test Buyer",
      country: "Singapore",
      email: "buyer@example.com",
      contactId: "contact-1",
    });
    order = store.createOrder({
      reference: "XO-TEST01",
      buyerId: buyer.id,
      product: "Test product",
      quantity: 10,
      amountSgd: 5_000,
      incoterm: "FOB",
      hsCode: "6109.10",
      paymentTerms: "TT",
      status: "InEscrow",
      shippingDocs: [],
    });
  });

  function virtualAccountBalance(): number {
    const exporter = store.getExporter()!;
    return store.getVirtualAccount(exporter.virtualAccountId)!.escrowBalanceSgd;
  }

  it("hold() creates a Held position with one event and increases the VA balance", () => {
    const position = mockEscrowService.hold(store, order);
    expect(position).toMatchObject({ orderId: order.id, amountSgd: 5_000, status: "Held" });
    expect(position.events).toHaveLength(1);
    expect(virtualAccountBalance()).toBe(105_000);
  });

  it("release() appends an event, marks Released, and decreases the VA balance", () => {
    const held = mockEscrowService.hold(store, order);
    const released = mockEscrowService.release(store, order);

    expect(released.status).toBe("Released");
    expect(released.events).toHaveLength(2);
    expect(held.events).toHaveLength(1); // the earlier snapshot is untouched (append, not mutate)
    expect(virtualAccountBalance()).toBe(100_000);
  });

  it("refund() appends an event, marks Refunded, and decreases the VA balance", () => {
    mockEscrowService.hold(store, order);
    const refunded = mockEscrowService.refund(store, order);

    expect(refunded.status).toBe("Refunded");
    expect(refunded.events).toHaveLength(2);
    expect(virtualAccountBalance()).toBe(100_000);
  });

  it("markDisputed() marks Disputed without moving funds, and resolveDispute() returns it to Held", () => {
    mockEscrowService.hold(store, order);
    const disputed = mockEscrowService.markDisputed(store, order);
    expect(disputed.status).toBe("Disputed");
    expect(virtualAccountBalance()).toBe(105_000);

    const resolved = mockEscrowService.resolveDispute(store, order);
    expect(resolved.status).toBe("Held");
    expect(resolved.events).toHaveLength(3);
    expect(virtualAccountBalance()).toBe(105_000);
  });

  it("writes an audit event for every lifecycle step", () => {
    mockEscrowService.hold(store, order);
    mockEscrowService.markDisputed(store, order);
    mockEscrowService.resolveDispute(store, order);
    mockEscrowService.release(store, order);

    const events = store.getAuditTrail().map((e) => e.event);
    expect(events).toEqual(["escrow.held", "escrow.disputed", "escrow.resolved", "escrow.released"]);
  });
});
