import type { FxQuote } from "@setu/types";
import type { FxServiceInterface } from "../interfaces/fxService.js";
import { round2 } from "../../util/money.js";

const BASE_RATE_SGD_INR = 63;
const RATE_JITTER = 0.4;
const SETU_SPREAD_PCT = 0.5;
const BANK_SPREAD_PCT = 3.5;
const FLAT_FEE_INR = 99;

export const mockFxService: FxServiceInterface = {
  quote(amountSgd: number): FxQuote {
    const jitter = (Math.random() * 2 - 1) * RATE_JITTER;
    const rateSgdInr = round2(BASE_RATE_SGD_INR + jitter);

    const setuNetRate = rateSgdInr * (1 - SETU_SPREAD_PCT / 100);
    const grossInr = amountSgd * setuNetRate;
    const feeInr = FLAT_FEE_INR;
    const netInr = round2(grossInr - feeInr);

    const bankNetRate = rateSgdInr * (1 - BANK_SPREAD_PCT / 100);
    const bankInr = amountSgd * bankNetRate;
    const savedVsBankInr = round2(netInr - bankInr);

    return {
      rateSgdInr,
      spreadPct: SETU_SPREAD_PCT,
      feeInr,
      netInr,
      savedVsBankInr,
    };
  },
};
