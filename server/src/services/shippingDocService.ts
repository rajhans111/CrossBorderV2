import type { ShippingDocType, TradeOrder } from "@setu/types";
import type { Store } from "../store/store.js";
import { NotFoundError, ValidationError } from "../errors.js";

export const SHIPPING_DOC_SEQUENCE: ShippingDocType[] = [
  "packing_list",
  "bill_of_lading",
  "certificate_of_origin",
  "shipping_bill_leo",
];

/**
 * Generates (and, for this MVP, immediately finalizes) one shipping document.
 * There is no separate "confirm" endpoint in the API surface, so a mock
 * generation is treated as final — the doc goes straight to "confirmed".
 * Docs must be generated strictly in SHIPPING_DOC_SEQUENCE order.
 */
export function generateShippingDoc(
  store: Store,
  reference: string,
  type: ShippingDocType,
): TradeOrder {
  const order = store.getOrderByReference(reference);
  if (!order) {
    throw new NotFoundError(`No trade order with reference "${reference}"`);
  }

  const doc = order.shippingDocs.find((d) => d.type === type);
  if (!doc) {
    throw new ValidationError(`Order "${reference}" has no shipping document of type "${type}"`);
  }
  if (doc.status === "confirmed") {
    throw new ValidationError(`Shipping document "${type}" is already confirmed`);
  }

  const priorTypes = SHIPPING_DOC_SEQUENCE.slice(0, SHIPPING_DOC_SEQUENCE.indexOf(type));
  const priorConfirmed = priorTypes.every(
    (t) => order.shippingDocs.find((d) => d.type === t)?.status === "confirmed",
  );
  if (!priorConfirmed) {
    throw new ValidationError(
      `Shipping documents must be generated in order: ${SHIPPING_DOC_SEQUENCE.join(", ")}`,
    );
  }

  const updatedDocs = order.shippingDocs.map((d) =>
    d.type === type ? { ...d, status: "confirmed" as const } : d,
  );
  const updatedOrder: TradeOrder = {
    ...order,
    shippingDocs: updatedDocs,
    updatedAt: new Date().toISOString(),
  };
  store.saveOrder(updatedOrder);
  store.addAuditEvent({
    event: `shippingdoc.${type}.generated`,
    actor: "exporter",
    entity: `TradeOrder:${reference}`,
    privileged: false,
  });

  return updatedOrder;
}
