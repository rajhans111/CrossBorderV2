import type { Currency, FxQuote } from "@setu/types";
import type { FxServiceInterface } from "../interfaces/fxService.js";
import { round2 } from "../../util/money.js";

// Approximate, fictional demo base rates (units of INR per 1 unit of currency)
// with a small per-quote jitter, same spirit as the original SGD-only model.
const BASE_RATE_TO_INR: Record<Currency, number> = {
  SGD: 63,
  USD: 83,
  EUR: 90,
  GBP: 105,
  AED: 22.6,
  AUD: 54,
};

const RATE_JITTER: Record<Currency, number> = {
  SGD: 0.4,
  USD: 0.5,
  EUR: 0.55,
  GBP: 0.65,
  AED: 0.15,
  AUD: 0.35,
};

const SETU_SPREAD_PCT = 0.5;
const BANK_SPREAD_PCT = 3.5;
const FLAT_FEE_INR = 99;

export const mockFxService: FxServiceInterface = {
  quote(amount: number, currency: Currency): FxQuote {
    const baseRate = BASE_RATE_TO_INR[currency];
    const jitter = (Math.random() * 2 - 1) * RATE_JITTER[currency];
    const rateToInr = round2(baseRate + jitter);

    const setuNetRate = rateToInr * (1 - SETU_SPREAD_PCT / 100);
    const grossInr = amount * setuNetRate;
    const feeInr = FLAT_FEE_INR;
    const netInr = round2(grossInr - feeInr);

    const bankNetRate = rateToInr * (1 - BANK_SPREAD_PCT / 100);
    const bankInr = amount * bankNetRate;
    const savedVsBankInr = round2(netInr - bankInr);

    return {
      currency,
      rateToInr,
      spreadPct: SETU_SPREAD_PCT,
      feeInr,
      netInr,
      savedVsBankInr,
    };
  },
};
