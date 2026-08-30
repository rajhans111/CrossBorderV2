import type { ErrorRequestHandler } from "express";
import { NotFoundError, ValidationError } from "../errors.js";
import { OrderTransitionError } from "../domain/orderStateMachine.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof OrderTransitionError) {
    res.status(409).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
