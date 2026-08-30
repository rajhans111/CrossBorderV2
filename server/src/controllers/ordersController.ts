import type { Request, Response } from "express";
import type { ShippingDocType, TradeOrder } from "@setu/types";
import { store } from "../store/singleton.js";
import { services } from "../services/container.js";
import { transitionOrder } from "../services/orderService.js";
import { resolveDispute, refundOrder } from "../services/orderWorkflow.js";
import { createOrder } from "../services/orderCreationService.js";
import { generateInvoice } from "../services/invoiceService.js";
import { generateShippingDoc, SHIPPING_DOC_SEQUENCE } from "../services/shippingDocService.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { parseCreateOrderInput, parseManualTransition, requireParam } from "../validation.js";

function toOrderSummary(order: TradeOrder) {
  const buyer = store.getBuyer(order.buyerId);
  return { ...order, buyerName: buyer?.name ?? "Unknown buyer" };
}

export function listOrders(req: Request, res: Response): void {
  const { status, search } = req.query;
  let orders = store.getAllOrders();

  if (typeof status === "string" && status) {
    orders = orders.filter((o) => o.status === status);
  }
  if (typeof search === "string" && search) {
    const needle = search.toLowerCase();
    orders = orders.filter((o) => {
      const buyer = store.getBuyer(o.buyerId);
      return (
        o.reference.toLowerCase().includes(needle) ||
        o.product.toLowerCase().includes(needle) ||
        (buyer?.name.toLowerCase().includes(needle) ?? false)
      );
    });
  }

  res.json(orders.map(toOrderSummary));
}

export function getOrder(req: Request, res: Response): void {
  const reference = requireParam(req.params, "ref");
  const order = store.getOrderByReference(reference);
  if (!order) {
    throw new NotFoundError(`No trade order with reference "${reference}"`);
  }

  res.json({
    ...order,
    buyer: store.getBuyer(order.buyerId),
    escrowPosition: store.getEscrowPosition(order.id),
    dispute: order.disputeId ? store.getDispute(order.disputeId) : undefined,
    fxQuote: store.getFxQuote(order.id),
    invoice: store.getInvoiceByOrderId(order.id),
    complianceArtefacts: store.getComplianceArtefactsByOrderId(order.id),
  });
}

export function postOrder(req: Request, res: Response): void {
  const input = parseCreateOrderInput(req.body);
  const order = createOrder(store, input);
  res.status(201).json(order);
}

export function postTransition(req: Request, res: Response): void {
  const reference = requireParam(req.params, "ref");
  const { event, actor } = parseManualTransition(req.body);

  const updated =
    event.type === "RESOLVE_DISPUTE"
      ? resolveDispute(store, services, reference)
      : event.type === "REFUND"
        ? refundOrder(store, services, reference)
        : transitionOrder(store, reference, event, actor);

  res.json(updated);
}

export function postInvoice(req: Request, res: Response): void {
  const reference = requireParam(req.params, "ref");
  const invoice = generateInvoice(store, reference);
  res.status(201).json(invoice);
}

export function postShippingDocGenerate(req: Request, res: Response): void {
  const reference = requireParam(req.params, "ref");
  const type = requireParam(req.params, "type");
  if (!SHIPPING_DOC_SEQUENCE.includes(type as ShippingDocType)) {
    throw new ValidationError(`Unknown shipping doc type "${type}"`);
  }
  const order = generateShippingDoc(store, reference, type as ShippingDocType);
  res.json(order);
}
