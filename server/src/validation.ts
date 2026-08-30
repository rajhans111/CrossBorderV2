import type { AuditActor, DisputeReason, Incoterm, PaymentTerms, TradeOrderEvent } from "@setu/types";
import { ValidationError } from "./errors.js";
import type { CreateOrderInput } from "./services/orderCreationService.js";

const INCOTERMS: Incoterm[] = ["FOB", "CIF", "EXW"];
const PAYMENT_TERMS: PaymentTerms[] = ["TT", "LC", "DP", "DA"];
const DISPUTE_REASONS: DisputeReason[] = [
  "goods_not_received",
  "damaged",
  "quantity_mismatch",
  "quality_issue",
];

// Event types allowed through the generic transition endpoint. The rest have
// dedicated flows (payment gateway, buyer confirm/dispute) that also need to
// trigger mock-service side effects, so they aren't exposed here.
const MANUAL_EVENT_TYPES = ["MARK_PAYMENT_AWAITED", "MARK_SHIPPED", "RESOLVE_DISPUTE", "REFUND"] as const;
type ManualEventType = (typeof MANUAL_EVENT_TYPES)[number];

const MANUAL_EVENT_ACTOR: Record<ManualEventType, AuditActor> = {
  MARK_PAYMENT_AWAITED: "exporter",
  MARK_SHIPPED: "exporter",
  RESOLVE_DISPUTE: "ops",
  REFUND: "ops",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Express route params are typed as possibly-undefined under noUncheckedIndexedAccess. */
export function requireParam(params: Record<string, string | undefined>, name: string): string {
  const value = params[name];
  if (!value) {
    throw new ValidationError(`Missing required route parameter "${name}"`);
  }
  return value;
}

export function parseCreateOrderInput(body: unknown): CreateOrderInput {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be an object");
  }
  const { buyerId, product, quantity, amountSgd, incoterm, hsCode, paymentTerms } = body;

  if (typeof buyerId !== "string" || !buyerId) {
    throw new ValidationError("buyerId is required");
  }
  if (typeof product !== "string" || !product) {
    throw new ValidationError("product is required");
  }
  if (typeof quantity !== "number" || !(quantity > 0)) {
    throw new ValidationError("quantity must be a positive number");
  }
  if (typeof amountSgd !== "number" || !(amountSgd > 0)) {
    throw new ValidationError("amountSgd must be a positive number");
  }
  if (typeof incoterm !== "string" || !INCOTERMS.includes(incoterm as Incoterm)) {
    throw new ValidationError(`incoterm must be one of ${INCOTERMS.join(", ")}`);
  }
  if (typeof hsCode !== "string" || !hsCode) {
    throw new ValidationError("hsCode is required");
  }
  if (typeof paymentTerms !== "string" || !PAYMENT_TERMS.includes(paymentTerms as PaymentTerms)) {
    throw new ValidationError(`paymentTerms must be one of ${PAYMENT_TERMS.join(", ")}`);
  }

  return {
    buyerId,
    product,
    quantity,
    amountSgd,
    incoterm: incoterm as Incoterm,
    hsCode,
    paymentTerms: paymentTerms as PaymentTerms,
  };
}

export function parseManualTransition(body: unknown): { event: TradeOrderEvent; actor: AuditActor } {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be an object");
  }
  const { type } = body;
  if (typeof type !== "string" || !MANUAL_EVENT_TYPES.includes(type as ManualEventType)) {
    throw new ValidationError(`type must be one of ${MANUAL_EVENT_TYPES.join(", ")}`);
  }
  const eventType = type as ManualEventType;
  return { event: { type: eventType }, actor: MANUAL_EVENT_ACTOR[eventType] };
}

export function parseDisputeReason(body: unknown): DisputeReason {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be an object");
  }
  const { reason } = body;
  if (typeof reason !== "string" || !DISPUTE_REASONS.includes(reason as DisputeReason)) {
    throw new ValidationError(`reason must be one of ${DISPUTE_REASONS.join(", ")}`);
  }
  return reason as DisputeReason;
}
