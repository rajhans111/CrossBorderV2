import type { Request, Response } from "express";
import { store } from "../store/singleton.js";
import { getExporterDashboard } from "../services/dashboardService.js";
import { NotFoundError } from "../errors.js";

export function getDashboard(_req: Request, res: Response): void {
  res.json(getExporterDashboard(store));
}

export function getBuyers(_req: Request, res: Response): void {
  res.json(store.getBuyers());
}

export function getVirtualAccount(_req: Request, res: Response): void {
  const exporter = store.getExporter();
  if (!exporter) {
    throw new NotFoundError("No exporter configured");
  }
  const account = store.getVirtualAccount(exporter.virtualAccountId);
  if (!account) {
    throw new NotFoundError("No virtual account configured");
  }

  const heldPositions = store
    .getAllOrders()
    .map((order) => ({ order, escrow: store.getEscrowPosition(order.id) }))
    .filter((entry) => entry.escrow?.status === "Held" || entry.escrow?.status === "Disputed")
    .map((entry) => ({
      reference: entry.order.reference,
      amountSgd: entry.escrow!.amountSgd,
      status: entry.escrow!.status,
    }));

  res.json({ ...account, heldPositions });
}
