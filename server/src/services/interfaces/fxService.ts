import type { FxQuote } from "@setu/types";

export interface FxServiceInterface {
  quote(amountSgd: number): FxQuote;
}
