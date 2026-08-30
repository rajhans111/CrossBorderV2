import type { Currency } from "./currency.js";

export interface VirtualAccount {
  id: string;
  currency: Currency;
  accountNo: string;
  bankName: string;
  swift: string;
  escrowBalance: number;
}
