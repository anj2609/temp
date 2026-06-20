import type { LoanInputs, Prepayment, PrepaymentPlan } from "@/types/domain";
import { buildAmortizationSchedule } from "./amortization";

export function partitionPrepayments(
  prepayments: Prepayment[],
  tenureMonths: number
): { valid: Prepayment[]; invalid: Prepayment[] } {
  const valid: Prepayment[] = [];
  const invalid: Prepayment[] = [];

  for (const p of prepayments) {
    const inRange =
      Number.isFinite(p.month) &&
      p.month >= 1 &&
      p.month <= tenureMonths &&
      p.amount > 0;
    if (inRange) valid.push(p);
    else invalid.push(p);
  }

  return { valid, invalid };
}

export function applyPrepaymentPlan(
  inputs: LoanInputs,
  prepayments: Prepayment[]
): PrepaymentPlan {
  const { valid, invalid } = partitionPrepayments(prepayments, inputs.tenureMonths);

  const baseline = buildAmortizationSchedule(inputs, []);
  const adjusted = buildAmortizationSchedule(inputs, valid);

  return {
    schedule: adjusted.rows,
    baselineSchedule: baseline.rows,
    interestSaved: baseline.totalInterest - adjusted.totalInterest,
    tenureReduced: baseline.rows.length - adjusted.rows.length,
    invalidPrepayments: invalid,
  };
}
