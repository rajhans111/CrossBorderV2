import { describe, expect, it } from "vitest";
import type { Currency } from "@setu/types";
import { mockFxService } from "./mockFxService.js";

const BASE_RATES: Record<Currency, { base: number; jitter: number }> = {
  SGD: { base: 63, jitter: 0.4 },
  USD: { base: 83, jitter: 0.5 },
  EUR: { base: 90, jitter: 0.55 },
  GBP: { base: 105, jitter: 0.65 },
  AED: { base: 22.6, jitter: 0.15 },
  AUD: { base: 54, jitter: 0.35 },
};

describe("mockFxService.quote", () => {
  it("keeps each currency's rate within its documented jitter band", () => {
    for (const [currency, { base, jitter }] of Object.entries(BASE_RATES) as [Currency, { base: number; jitter: number }][]) {
      for (let i = 0; i < 20; i += 1) {
        const quote = mockFxService.quote(50_000, currency);
        expect(quote.currency).toBe(currency);
        const epsilon = 0.01;
        expect(quote.rateToInr).toBeGreaterThanOrEqual(base - jitter - epsilon);
        expect(quote.rateToInr).toBeLessThanOrEqual(base + jitter + epsilon);
      }
    }
  });

  it("always reports Setu's transparent 0.5% spread", () => {
    const quote = mockFxService.quote(50_000, "SGD");
    expect(quote.spreadPct).toBe(0.5);
  });

  it("computes netInr as amount at the 0.5%-spread rate, minus the flat fee", () => {
    const amount = 50_000;
    const quote = mockFxService.quote(amount, "SGD");
    const expectedNet = Math.round((amount * quote.rateToInr * (1 - 0.005) - quote.feeInr) * 100) / 100;
    expect(quote.netInr).toBeCloseTo(expectedNet, 2);
  });

  it("computes savedVsBankInr as netInr minus what a 3.5%-spread bank would have paid", () => {
    const amount = 50_000;
    const quote = mockFxService.quote(amount, "SGD");
    const bankInr = amount * quote.rateToInr * (1 - 0.035);
    const expectedSaved = Math.round((quote.netInr - bankInr) * 100) / 100;
    expect(quote.savedVsBankInr).toBeCloseTo(expectedSaved, 2);
  });

  it("shows a positive saving vs. bank for realistic trade order sizes, for every currency", () => {
    for (const currency of Object.keys(BASE_RATES) as Currency[]) {
      const quote = mockFxService.quote(50_000, currency);
      expect(quote.savedVsBankInr).toBeGreaterThan(0);
    }
  });
});
