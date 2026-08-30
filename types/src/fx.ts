import type { Currency } from "./currency.js";

export interface FxQuote {
  currency: Currency;
  /** Units of INR per 1 unit of `currency`. */
  rateToInr: number;
  spreadPct: number;
  feeInr: number;
  netInr: number;
  savedVsBankInr: number;
}
