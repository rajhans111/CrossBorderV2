import type {
  Currency,
  DisputeReason,
  Incoterm,
  PaymentTerms,
  ShippingDoc,
  TradeOrderEvent,
  TradeOrderStatus,
} from "@setu/types";
import type { Store } from "./store.js";
import { transitionOrder } from "../services/orderService.js";
import { completeOnboarding } from "../services/onboardingService.js";

function shippingDocs(confirmed: boolean): ShippingDoc[] {
  const status = confirmed ? "confirmed" : "pending";
  return [
    { type: "packing_list", status },
    { type: "bill_of_lading", status },
    { type: "certificate_of_origin", status },
    { type: "shipping_bill_leo", status },
  ];
}

const MAIN_PATH: { status: TradeOrderStatus; event: TradeOrderEvent }[] = [
  { status: "PaymentAwaited", event: { type: "MARK_PAYMENT_AWAITED" } },
  { status: "InEscrow", event: { type: "PAYMENT_RECEIVED" } },
  { status: "Shipped", event: { type: "MARK_SHIPPED" } },
  { status: "DeliveryConfirmed", event: { type: "CONFIRM_DELIVERY" } },
  { status: "FxSettled", event: { type: "SETTLE_FX" } },
  { status: "Completed", event: { type: "COMPLETE" } },
];

// Every seeded VirtualAccount, one per supported currency. Only SGD carries
// the spec's literal opening balance/account facts; the rest start empty and
// exist so newly created orders in other currencies have somewhere to settle.
const VIRTUAL_ACCOUNTS: {
  currency: Currency;
  accountNo: string;
  bankName: string;
  swift: string;
  escrowBalance: number;
}[] = [
  {
    currency: "SGD",
    accountNo: "SGD7788123456",
    bankName: "MAS Partner Bank (Demo)",
    swift: "XINT0SGSXXX",
    escrowBalance: 152_900,
  },
  {
    currency: "USD",
    accountNo: "USD4402198765",
    bankName: "Global Partner Bank (Demo)",
    swift: "XINT0USNYXX",
    escrowBalance: 0,
  },
  {
    currency: "EUR",
    accountNo: "EUR9931056421",
    bankName: "Euro Partner Bank (Demo)",
    swift: "XINT0DEFRXX",
    escrowBalance: 0,
  },
  {
    currency: "GBP",
    accountNo: "GBP1187654320",
    bankName: "UK Partner Bank (Demo)",
    swift: "XINT0GBLNXX",
    escrowBalance: 0,
  },
  {
    currency: "AED",
    accountNo: "AED6650012398",
    bankName: "Gulf Partner Bank (Demo)",
    swift: "XINT0AEDXXX",
    escrowBalance: 0,
  },
  {
    currency: "AUD",
    accountNo: "AUD3324567891",
    bankName: "Sydney Partner Bank (Demo)",
    swift: "XINT0AUSYXX",
    escrowBalance: 0,
  },
];

interface SeedOrderSpec {
  reference: string;
  buyerName: string;
  product: string;
  quantity: number;
  amount: number;
  currency: Currency;
  incoterm: Incoterm;
  hsCode: string;
  paymentTerms: PaymentTerms;
  targetStatus: TradeOrderStatus;
  disputeReason?: DisputeReason;
}

const SEED_ORDERS: SeedOrderSpec[] = [
  {
    reference: "XO-DRAFT08",
    buyerName: "Orchid Home Living",
    product: "Sample pack — mixed knits",
    quantity: 50,
    amount: 9_800,
    currency: "SGD",
    incoterm: "EXW",
    hsCode: "6109.10",
    paymentTerms: "TT",
    targetStatus: "Created",
  },
  {
    reference: "XO-DONE07",
    buyerName: "Pacific Softgoods Pte Ltd",
    product: "Jersey dresses — 3,200 pcs",
    quantity: 3_200,
    amount: 41_800,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6104.43",
    paymentTerms: "TT",
    targetStatus: "Completed",
  },
  {
    reference: "XO-DISP06",
    buyerName: "Harbour Fashion SG",
    product: "Fleece hoodies — 2,400 pcs",
    quantity: 2_400,
    amount: 22_100,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6110.20",
    paymentTerms: "TT",
    targetStatus: "Disputed",
    disputeReason: "goods_not_received",
  },
  {
    reference: "XO-SHIP05",
    buyerName: "Lion City Retail Pte Ltd",
    product: "Ribbed tank tops — 9,600 pcs",
    quantity: 9_600,
    amount: 33_400,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6109.90",
    paymentTerms: "TT",
    targetStatus: "Shipped",
  },
  {
    reference: "XO-DOCS04",
    buyerName: "Orchid Home Living",
    product: "Home textile cushion covers — 6,000 pcs",
    quantity: 6_000,
    amount: 15_600,
    currency: "SGD",
    incoterm: "CIF",
    hsCode: "6304.93",
    paymentTerms: "DP",
    targetStatus: "InEscrow",
  },
  {
    reference: "XO-ESCROW03",
    buyerName: "Pacific Softgoods Pte Ltd",
    product: "Polyester blend polos — 18,000 pcs",
    quantity: 18_000,
    amount: 72_000,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6105.20",
    paymentTerms: "TT",
    targetStatus: "InEscrow",
  },
  {
    reference: "XO-AWAIT02",
    buyerName: "Harbour Fashion SG",
    product: "Organic cotton kidswear",
    quantity: 5_000,
    amount: 28_500,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6111.20",
    paymentTerms: "TT",
    targetStatus: "PaymentAwaited",
  },
  {
    reference: "XO-DEMO01",
    buyerName: "Lion City Retail Pte Ltd",
    product: "Cotton knit T-shirts — 12,000 pcs",
    quantity: 12_000,
    amount: 50_000,
    currency: "SGD",
    incoterm: "FOB",
    hsCode: "6109.10",
    paymentTerms: "LC",
    targetStatus: "Created",
  },
];

export function loadSeed(store: Store): void {
  // The demo exporter is seeded as already-onboarded, but it still goes
  // through the real completeOnboarding() service — the same path a newly
  // registered exporter would take — so the virtual accounts are genuinely
  // created and linked via onboarding, not just dropped into the store.
  completeOnboarding(store, {
    companyName: "Mehta Knitwear Exports Pvt Ltd",
    gstin: "33AABCM1234A1Z5",
    iec: "AABCM1234A",
    msmeUdyam: "UDYAM-TN-03-0012345",
    city: "Tirupur",
    industry: "Textile",
    directorName: "Rajesh Mehta",
    directorPan: "AAAPM1234A",
    bankAccountNo: "50100123456789",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank (Demo)",
    settlementCurrency: "SGD",
    virtualAccounts: VIRTUAL_ACCOUNTS,
  });

  const buyerNames = [
    "Harbour Fashion SG",
    "Lion City Retail Pte Ltd",
    "Orchid Home Living",
    "Pacific Softgoods Pte Ltd",
  ];
  const buyersByName = new Map(
    buyerNames.map((name) => [
      name,
      store.createBuyer({
        name,
        country: "Singapore",
        email: `contact@${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.demo`,
        contactId: `contact-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      }),
    ]),
  );

  for (const spec of SEED_ORDERS) {
    const buyer = buyersByName.get(spec.buyerName);
    if (!buyer) {
      throw new Error(`Seed error: unknown buyer "${spec.buyerName}"`);
    }

    const needsConfirmedDocs =
      spec.targetStatus === "Shipped" ||
      spec.targetStatus === "DeliveryConfirmed" ||
      spec.targetStatus === "FxSettled" ||
      spec.targetStatus === "Completed";

    store.createOrder({
      reference: spec.reference,
      buyerId: buyer.id,
      product: spec.product,
      quantity: spec.quantity,
      amount: spec.amount,
      currency: spec.currency,
      incoterm: spec.incoterm,
      hsCode: spec.hsCode,
      paymentTerms: spec.paymentTerms,
      status: "Created",
      shippingDocs: shippingDocs(needsConfirmedDocs),
    });

    // A dispute always branches off from InEscrow in this seed data, so drive
    // the main path only that far before raising it.
    const mainPathStopStatus = spec.targetStatus === "Disputed" ? "InEscrow" : spec.targetStatus;

    for (const step of MAIN_PATH) {
      const current = store.getOrderByReference(spec.reference)!;
      if (current.status === mainPathStopStatus) break;
      transitionOrder(store, spec.reference, step.event, "seed");
    }

    if (spec.targetStatus === "Disputed") {
      transitionOrder(
        store,
        spec.reference,
        { type: "RAISE_DISPUTE", reason: spec.disputeReason!, openedBy: "buyer" },
        "seed",
      );
    }

    const finalOrder = store.getOrderByReference(spec.reference)!;
    if (finalOrder.status === "InEscrow" || finalOrder.status === "Shipped") {
      store.saveEscrowPosition({
        orderId: finalOrder.id,
        amount: finalOrder.amount,
        currency: finalOrder.currency,
        status: "Held",
        events: [{ when: finalOrder.updatedAt, event: "escrow.held" }],
      });
    } else if (finalOrder.status === "Disputed") {
      store.saveEscrowPosition({
        orderId: finalOrder.id,
        amount: finalOrder.amount,
        currency: finalOrder.currency,
        status: "Disputed",
        events: [{ when: finalOrder.updatedAt, event: "escrow.disputed" }],
      });
    } else if (finalOrder.status === "Completed") {
      store.saveEscrowPosition({
        orderId: finalOrder.id,
        amount: finalOrder.amount,
        currency: finalOrder.currency,
        status: "Released",
        events: [{ when: finalOrder.updatedAt, event: "escrow.released" }],
      });
    }
  }

  store.addComplianceArtefact({
    orderId: store.getOrderByReference("XO-DONE07")!.id,
    type: "EDPMS",
    status: "Pending Ad Bank Ack",
  });

  store.addScreeningCase({
    entityName: "Shah Pharma Exports",
    list: "Watchlist",
    status: "Needs_review",
    note: "Name-similarity match against a sanctions watchlist entry — pending manual review.",
  });
  store.addAuditEvent({
    event: "screening.flagged",
    actor: "system",
    entity: "ScreeningCase:Shah Pharma Exports",
    privileged: true,
    beforeState: { status: "none" },
    afterState: { status: "Needs_review" },
    evidence: "name-similarity match against a sanctions watchlist entry",
  });

  store.addUnmatchedCredit({
    amount: 2_500,
    currency: "SGD",
    remitterName: "Unknown SG Remitter",
    receivedAt: new Date().toISOString(),
    note: "Inbound VA credit could not be matched to an open trade order.",
  });
}
