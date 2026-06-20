import { describe, expect, it } from "vitest";
import { calculateEmi, calculateLoanSummary } from "../emi";

describe("calculateEmi", () => {
  it("matches the spec worked example (15L @ 11% / 48mo)", () => {
    const emi = calculateEmi(1_500_000, 11, 48);
    expect(Math.round(emi)).toBe(38768);
  });

  it("returns principal / tenure when the rate is zero", () => {
    expect(calculateEmi(120_000, 0, 12)).toBeCloseTo(10_000, 6);
  });

  it("returns 0 for zero tenure", () => {
    expect(calculateEmi(100_000, 11, 0)).toBe(0);
  });

  it("returns 0 for zero principal", () => {
    expect(calculateEmi(0, 11, 48)).toBe(0);
  });

  it("handles the maximum rate boundary", () => {
    const emi = calculateEmi(1_000_000, 36, 84);
    expect(emi).toBeGreaterThan(0);
    expect(Number.isFinite(emi)).toBe(true);
  });
});

describe("calculateLoanSummary", () => {
  it("derives totals from the spec example", () => {
    const summary = calculateLoanSummary({
      principal: 1_500_000,
      annualRate: 11,
      tenureMonths: 48,
    });
    expect(Math.round(summary.totalPayable)).toBe(1_860_878);
    expect(Math.round(summary.totalInterest)).toBe(360_878);
    expect(summary.principalSharePct + summary.interestSharePct).toBeCloseTo(100, 6);
  });
});
