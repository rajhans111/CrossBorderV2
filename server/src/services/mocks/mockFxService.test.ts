import { describe, expect, it } from "vitest";
import { mockFxService } from "./mockFxService.js";

describe("mockFxService.quote", () => {
  it("keeps the rate within the documented jitter band around the ~63 base rate", () => {
    for (let i = 0; i < 50; i += 1) {
      const quote = mockFxService.quote(50_000);
      expect(quote.rateSgdInr).toBeGreaterThanOrEqual(63 - 0.4);
      expect(quote.rateSgdInr).toBeLessThanOrEqual(63 + 0.4);
    }
  });

  it("always reports Setu's transparent 0.5% spread", () => {
    const quote = mockFxService.quote(50_000);
    expect(quote.spreadPct).toBe(0.5);
  });

  it("computes netInr as amount at the 0.5%-spread rate, minus the flat fee", () => {
    const amountSgd = 50_000;
    const quote = mockFxService.quote(amountSgd);
    const expectedNet = Math.round((amountSgd * quote.rateSgdInr * (1 - 0.005) - quote.feeInr) * 100) / 100;
    expect(quote.netInr).toBeCloseTo(expectedNet, 2);
  });

  it("computes savedVsBankInr as netInr minus what a 3.5%-spread bank would have paid", () => {
    const amountSgd = 50_000;
    const quote = mockFxService.quote(amountSgd);
    const bankInr = amountSgd * quote.rateSgdInr * (1 - 0.035);
    const expectedSaved = Math.round((quote.netInr - bankInr) * 100) / 100;
    expect(quote.savedVsBankInr).toBeCloseTo(expectedSaved, 2);
  });

  it("shows a positive saving vs. bank for realistic trade order sizes", () => {
    const quote = mockFxService.quote(50_000);
    expect(quote.savedVsBankInr).toBeGreaterThan(0);
  });
});
