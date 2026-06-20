import { describe, expect, it } from "vitest";
import { applyPrepaymentPlan } from "../prepayment";
import { pickBestScenario, summarizeScenarios } from "../comparison";

const baseLoan = { principal: 1_500_000, annualRate: 11, tenureMonths: 48 };

describe("applyPrepaymentPlan", () => {
  it("saves interest and shortens tenure for a 1L prepayment at month 12", () => {
    const plan = applyPrepaymentPlan(baseLoan, [
      { id: "p1", month: 12, amount: 100_000 },
    ]);
    expect(plan.tenureReduced).toBe(3);
    expect(Math.round(plan.interestSaved)).toBeGreaterThan(35_000);
    expect(Math.round(plan.interestSaved)).toBeLessThan(42_000);
  });

  it("filters prepayments scheduled beyond the current tenure", () => {
    const plan = applyPrepaymentPlan(baseLoan, [
      { id: "p1", month: 200, amount: 100_000 },
    ]);
    expect(plan.invalidPrepayments).toHaveLength(1);
    expect(plan.tenureReduced).toBe(0);
    expect(plan.interestSaved).toBeCloseTo(0, 6);
  });
});

describe("scenario comparison", () => {
  it("picks the lowest total payable across tenures", () => {
    const summaries = summarizeScenarios({
      A: { principal: 1_500_000, annualRate: 11, tenureMonths: 24 },
      B: { principal: 1_500_000, annualRate: 11, tenureMonths: 48 },
      C: { principal: 1_500_000, annualRate: 11, tenureMonths: 60 },
    });

    expect(Math.round(summaries.A.emi)).toBe(69_912);
    expect(Math.round(summaries.C.emi)).toBe(32_614);
    expect(pickBestScenario(summaries)).toBe("A");
  });
});
