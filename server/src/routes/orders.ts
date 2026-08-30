import { Router } from "express";
import {
  getOrder,
  listOrders,
  postInvoice,
  postOrder,
  postShippingDocGenerate,
  postTransition,
} from "../controllers/ordersController.js";

export const ordersRouter = Router();

ordersRouter.get("/", listOrders);
ordersRouter.get("/:ref", getOrder);
ordersRouter.post("/", postOrder);
ordersRouter.post("/:ref/transition", postTransition);
ordersRouter.post("/:ref/invoice", postInvoice);
ordersRouter.post("/:ref/shipping-docs/:type/generate", postShippingDocGenerate);
