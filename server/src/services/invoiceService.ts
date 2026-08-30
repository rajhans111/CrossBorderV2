import type { Invoice } from "@setu/types";
import type { Store } from "../store/store.js";
import { NotFoundError } from "../errors.js";
import { round2 } from "../util/money.js";

export function generateInvoice(store: Store, reference: string): Invoice {
  const order = store.getOrderByReference(reference);
  if (!order) {
    throw new NotFoundError(`No trade order with reference "${reference}"`);
  }
  const exporter = store.getExporter();
  if (!exporter) {
    throw new NotFoundError("No exporter configured");
  }
  const buyer = store.getBuyer(order.buyerId);
  if (!buyer) {
    throw new NotFoundError(`No buyer for order "${reference}"`);
  }
  const virtualAccount = store.getVirtualAccountByCurrency(order.currency);

  const invoice: Invoice = {
    invoiceNo: `INV-${order.reference}`,
    orderId: order.id,
    from: exporter.companyName,
    billTo: buyer.name,
    currency: order.currency,
    lineItems: [
      {
        description: order.product,
        quantity: order.quantity,
        unitPrice: round2(order.amount / order.quantity),
      },
    ],
    subtotal: order.amount,
    totalDue: order.amount,
    paymentInstructions: virtualAccount
      ? `Pay ${order.currency} ${order.amount} to ${virtualAccount.bankName}, account ${virtualAccount.accountNo} (SWIFT ${virtualAccount.swift}), referencing ${order.reference}.`
      : `Pay ${order.currency} ${order.amount}, referencing ${order.reference}.`,
    status: "Sent",
  };

  store.saveInvoice(invoice);
  store.addAuditEvent({
    event: "invoice.generated",
    actor: "exporter",
    entity: `TradeOrder:${reference}`,
    privileged: false,
  });

  return invoice;
}
