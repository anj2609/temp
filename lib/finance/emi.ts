import type { LoanInputs, LoanSummary } from "@/types/domain";

export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  const growth = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function calculateLoanSummary(inputs: LoanInputs): LoanSummary {
  const { principal, annualRate, tenureMonths } = inputs;
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;

  const principalSharePct = totalPayable > 0 ? (principal / totalPayable) * 100 : 0;
  const interestSharePct = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  return {
    emi,
    totalPayable,
    totalInterest,
    principalSharePct,
    interestSharePct,
  };
}
