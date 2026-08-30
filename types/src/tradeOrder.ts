import type { TradeOrderStatus } from "./orderStatus.js";
import type { ShippingDoc } from "./shippingDoc.js";
import type { Currency } from "./currency.js";

export type Incoterm = "FOB" | "CIF" | "EXW";
export type PaymentTerms = "TT" | "LC" | "DP" | "DA";

export interface TradeOrder {
  id: string;
  reference: string;
  buyerId: string;
  product: string;
  quantity: number;
  amount: number;
  currency: Currency;
  incoterm: Incoterm;
  hsCode: string;
  paymentTerms: PaymentTerms;
  status: TradeOrderStatus;
  createdAt: string;
  updatedAt: string;
  shippingDocs: ShippingDoc[];
  disputeId?: string;
  /** Unguessable token for the no-login buyer magic-link portal. */
  buyerToken: string;
}
