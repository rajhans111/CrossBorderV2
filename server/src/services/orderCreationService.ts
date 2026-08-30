import type { Incoterm, PaymentTerms, TradeOrder } from "@setu/types";
import type { Store } from "../store/store.js";
import { ValidationError } from "../errors.js";
import { SHIPPING_DOC_SEQUENCE } from "./shippingDocService.js";

export interface CreateOrderInput {
  buyerId: string;
  product: string;
  quantity: number;
  amountSgd: number;
  incoterm: Incoterm;
  hsCode: string;
  paymentTerms: PaymentTerms;
}

export function createOrder(store: Store, input: CreateOrderInput): TradeOrder {
  const buyer = store.getBuyer(input.buyerId);
  if (!buyer) {
    throw new ValidationError(`Unknown buyerId "${input.buyerId}"`);
  }

  const reference = nextReference(store);
  const order = store.createOrder({
    reference,
    buyerId: input.buyerId,
    product: input.product,
    quantity: input.quantity,
    amountSgd: input.amountSgd,
    incoterm: input.incoterm,
    hsCode: input.hsCode,
    paymentTerms: input.paymentTerms,
    status: "Created",
    shippingDocs: SHIPPING_DOC_SEQUENCE.map((type) => ({ type, status: "pending" as const })),
  });

  store.addAuditEvent({
    event: "order.created",
    actor: "exporter",
    entity: `TradeOrder:${reference}`,
    privileged: false,
  });

  return order;
}

function nextReference(store: Store): string {
  const existing = new Set(store.getAllOrders().map((o) => o.reference));
  let n = 1;
  let reference = `XO-${String(n).padStart(3, "0")}`;
  while (existing.has(reference)) {
    n += 1;
    reference = `XO-${String(n).padStart(3, "0")}`;
  }
  return reference;
}
