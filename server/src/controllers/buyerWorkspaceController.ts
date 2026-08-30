import type { Request, Response } from "express";
import { store } from "../store/singleton.js";
import { NotFoundError } from "../errors.js";
import { requireParam } from "../validation.js";

export function getBuyerWorkspace(req: Request, res: Response): void {
  const token = requireParam(req.params, "token");
  const buyer = store.getBuyerByPortalToken(token);
  if (!buyer) {
    throw new NotFoundError("Invalid or expired link");
  }

  const orders = store.getAllOrders().filter((o) => o.buyerId === buyer.id);

  res.json({ buyer, orders });
}
