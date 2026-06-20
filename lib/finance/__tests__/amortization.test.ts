import { describe, expect, it } from "vitest";
import { buildAmortizationSchedule, findBreakEvenMonth } from "../amortization";

const baseLoan = { principal: 1_500_000, annualRate: 11, tenureMonths: 48 };

describe("buildAmortizationSchedule", () => {
  it("produces the spec's first two rows", () => {
    const { rows } = buildAmortizationSchedule(baseLoan);

    expect(Math.round(rows[0].interestPaid)).toBe(13_750);
    expect(Math.round(rows[0].principalPaid)).toBe(25_018);
    expect(Math.round(rows[0].balance)).toBe(1_474_982);

    expect(Math.round(rows[1].interestPaid)).toBe(13_521);
    expect(rows[1].principalPaid).toBeCloseTo(25_247.62, 1);
    expect(rows[1].balance).toBeCloseTo(1_449_734.1, 1);
  });

  it("runs for the full tenure and pays the balance to zero", () => {
    const { rows } = buildAmortizationSchedule(baseLoan);
    expect(rows).toHaveLength(48);
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("shortens the schedule and clamps an oversized prepayment", () => {
    const { rows } = buildAmortizationSchedule(baseLoan, [
      { id: "p1", month: 2, amount: 10_000_000 },
    ]);
    expect(rows.length).toBeLessThan(48);
    expect(rows[rows.length - 1].balance).toBe(0);
  });

  it("sums multiple prepayments in the same month", () => {
    const single = buildAmortizationSchedule(baseLoan, [
      { id: "a", month: 6, amount: 200_000 },
    ]);
    const split = buildAmortizationSchedule(baseLoan, [
      { id: "a", month: 6, amount: 100_000 },
      { id: "b", month: 6, amount: 100_000 },
    ]);
    expect(split.rows.length).toBe(single.rows.length);
    expect(split.totalInterest).toBeCloseTo(single.totalInterest, 2);
  });
});

describe("findBreakEvenMonth", () => {
  it("finds the month where cumulative principal overtakes interest", () => {
    const { rows } = buildAmortizationSchedule(baseLoan);
    const breakEven = findBreakEvenMonth(rows);
    expect(breakEven).not.toBeNull();
    expect(breakEven).toBeGreaterThanOrEqual(1);
    expect(breakEven).toBeLessThanOrEqual(48);
  });
});
