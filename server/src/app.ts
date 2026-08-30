import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { ordersRouter } from "./routes/orders.js";
import { exporterRouter } from "./routes/exporter.js";
import { buyerRouter } from "./routes/buyer.js";
import { adminRouter } from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/src (dev, via tsx) or server/dist (built) -> repo root -> client/dist
const CLIENT_DIST = path.resolve(__dirname, "../../client/dist");

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/exporter", exporterRouter);
  app.use("/api/buyer", buyerRouter);
  app.use("/api/admin", adminRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Single-service Render deploy: serve the built client and fall back to
  // its index.html for client-side routes. In local dev the client isn't
  // built here (Vite serves it on its own port instead), so this no-ops.
  if (existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(CLIENT_DIST, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}
