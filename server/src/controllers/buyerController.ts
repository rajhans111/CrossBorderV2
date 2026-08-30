import type { Request, Response } from "express";
import { store } from "../store/singleton.js";
import { services } from "../services/container.js";
import { confirmDelivery, raiseDispute, receivePayment } from "../services/orderWorkflow.js";
import { NotFoundError } from "../errors.js";
import { parseDisputeReason, requireParam } from "../validation.js";
import type { TradeOrder } from "@setu/types";

function requireOrderByToken(token: string): TradeOrder {
  const order = store.getOrderByToken(token);
  if (!order) {
    throw new NotFoundError("Invalid or expired link");
  }
  return order;
}

export function getBuyerPortal(req: Request, res: Response): void {
  const order = requireOrderByToken(requireParam(req.params, "token"));
  const exporter = store.getExporter();

  res.json({
    order,
    buyer: store.getBuyer(order.buyerId),
    virtualAccount: exporter ? store.getVirtualAccount(exporter.virtualAccountId) : undefined,
    escrowPosition: store.getEscrowPosition(order.id),
    dispute: order.disputeId ? store.getDispute(order.disputeId) : undefined,
  });
}

export function postPay(req: Request, res: Response): void {
  const order = requireOrderByToken(requireParam(req.params, "token"));
  const updated = receivePayment(store, services, order.reference);
  res.json(updated);
}

export function postConfirm(req: Request, res: Response): void {
  const order = requireOrderByToken(requireParam(req.params, "token"));
  const updated = confirmDelivery(store, services, order.reference);
  res.json(updated);
}

export function postDispute(req: Request, res: Response): void {
  const order = requireOrderByToken(requireParam(req.params, "token"));
  const reason = parseDisputeReason(req.body);
  const updated = raiseDispute(store, services, order.reference, reason, "buyer");
  res.json(updated);
}
