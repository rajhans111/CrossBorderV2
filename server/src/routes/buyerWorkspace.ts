import { Router } from "express";
import { getBuyerWorkspace } from "../controllers/buyerWorkspaceController.js";

export const buyerWorkspaceRouter = Router();

buyerWorkspaceRouter.get("/:token", getBuyerWorkspace);
