import { Router } from "express";
import { getBuyers, getDashboard, getVirtualAccount } from "../controllers/exporterController.js";

export const exporterRouter = Router();

exporterRouter.get("/dashboard", getDashboard);
exporterRouter.get("/virtual-account", getVirtualAccount);
exporterRouter.get("/buyers", getBuyers);
