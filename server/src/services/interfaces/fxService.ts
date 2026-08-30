import type { Currency, FxQuote } from "@setu/types";

export interface FxServiceInterface {
  quote(amount: number, currency: Currency): FxQuote;
}
