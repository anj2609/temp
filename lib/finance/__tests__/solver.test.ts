import { describe, expect, it } from "vitest";
import { solvePrincipal, solveTenure } from "../solver";
import { calculateEmi } from "../emi";

describe("solvePrincipal", () => {
  it("round-trips against calculateEmi", () => {
    const principal = solvePrincipal(38768, 11, 48);
    expect(Math.round(principal / 1000) * 1000).toBe(1_500_000);
    expect(Math.round(calculateEmi(principal, 11, 48))).toBe(38768);
  });

  it("uses budget * tenure when the rate is zero", () => {
    expect(solvePrincipal(10_000, 0, 12)).toBeCloseTo(120_000, 6);
  });
});

describe("solveTenure", () => {
  it("recovers the original tenure from its exact EMI", () => {
    const exactEmi = calculateEmi(1_500_000, 11, 48);
    expect(solveTenure(exactEmi, 1_500_000, 11)).toBe(48);
  });

  it("returns null when the budget cannot even cover the interest", () => {
    expect(solveTenure(5_000, 1_500_000, 11)).toBeNull();
  });

  it("shortens the tenure as the budget grows", () => {
    const longer = solveTenure(38768, 1_500_000, 11)!;
    const shorter = solveTenure(70_000, 1_500_000, 11)!;
    expect(shorter).toBeLessThan(longer);
  });
});
