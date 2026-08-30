import { Router } from "express";
import { getOverview, postKycApprove, postReset } from "../controllers/adminController.js";

export const adminRouter = Router();

adminRouter.get("/overview", getOverview);
adminRouter.post("/kyc/:id/approve", postKycApprove);
adminRouter.post("/reset", postReset);
