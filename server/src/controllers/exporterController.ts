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

  const orders = store.getAllOrders();
  const accounts = store.getAllVirtualAccounts().map((account) => {
    const heldPositions = orders
      .filter((order) => order.currency === account.currency)
      .map((order) => ({ order, escrow: store.getEscrowPosition(order.id) }))
      .filter((entry) => entry.escrow?.status === "Held" || entry.escrow?.status === "Disputed")
      .map((entry) => ({
        reference: entry.order.reference,
        amount: entry.escrow!.amount,
        status: entry.escrow!.status,
      }));

    return { ...account, heldPositions };
  });

  res.json({ accounts });
}
