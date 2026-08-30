import type { Currency } from "./currency.js";

export interface UnmatchedVaCredit {
  id: string;
  amount: number;
  currency: Currency;
  remitterName: string;
  receivedAt: string;
  note: string;
}
