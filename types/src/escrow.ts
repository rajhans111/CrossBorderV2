export type EscrowStatus = "Held" | "Released" | "Refunded" | "Disputed";

export interface EscrowEvent {
  when: string;
  event: string;
}

export interface EscrowPosition {
  orderId: string;
  amountSgd: number;
  status: EscrowStatus;
  events: EscrowEvent[];
}
