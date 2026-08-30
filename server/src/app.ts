import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { ordersRouter } from "./routes/orders.js";
import { exporterRouter } from "./routes/exporter.js";
import { buyerRouter } from "./routes/buyer.js";
import { adminRouter } from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/exporter", exporterRouter);
  app.use("/api/buyer", buyerRouter);
  app.use("/api/admin", adminRouter);

  app.use(errorHandler);

  return app;
}
