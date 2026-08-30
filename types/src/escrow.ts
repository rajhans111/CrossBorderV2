import type { Currency } from "./currency.js";

export type EscrowStatus = "Held" | "Released" | "Refunded" | "Disputed";

export interface EscrowEvent {
  when: string;
  event: string;
}

export interface EscrowPosition {
  orderId: string;
  amount: number;
  currency: Currency;
  status: EscrowStatus;
  events: EscrowEvent[];
}
