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
  const virtualAccount = store.getVirtualAccount(exporter.virtualAccountId);

  const invoice: Invoice = {
    invoiceNo: `INV-${order.reference}`,
    orderId: order.id,
    from: exporter.companyName,
    billTo: buyer.name,
    lineItems: [
      {
        description: order.product,
        quantity: order.quantity,
        unitPriceSgd: round2(order.amountSgd / order.quantity),
      },
    ],
    subtotal: order.amountSgd,
    totalDue: order.amountSgd,
    paymentInstructions: virtualAccount
      ? `Pay SGD ${order.amountSgd} to ${virtualAccount.bankName}, account ${virtualAccount.accountNo} (SWIFT ${virtualAccount.swift}), referencing ${order.reference}.`
      : `Pay SGD ${order.amountSgd}, referencing ${order.reference}.`,
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
