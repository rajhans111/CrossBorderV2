import { Router } from "express";
import { getBuyerPortal, postConfirm, postDispute, postPay } from "../controllers/buyerController.js";

export const buyerRouter = Router();

buyerRouter.get("/:token", getBuyerPortal);
buyerRouter.post("/:token/pay", postPay);
buyerRouter.post("/:token/confirm", postConfirm);
buyerRouter.post("/:token/dispute", postDispute);
