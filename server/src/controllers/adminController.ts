import type { Request, Response } from "express";
import { store, resetStore } from "../store/singleton.js";
import { services } from "../services/container.js";
import { getAdminOverview } from "../services/dashboardService.js";
import { requireParam } from "../validation.js";

export function getOverview(_req: Request, res: Response): void {
  res.json(getAdminOverview(store));
}

export function postKycApprove(req: Request, res: Response): void {
  const exporter = services.kycService.approve(store, requireParam(req.params, "id"));
  res.json(exporter);
}

export function postReset(_req: Request, res: Response): void {
  resetStore();
  res.json({ status: "reset" });
}
