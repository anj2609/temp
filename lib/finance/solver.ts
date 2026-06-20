export function solvePrincipal(
  targetEmi: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (targetEmi <= 0 || tenureMonths <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return targetEmi * tenureMonths;

  const growth = Math.pow(1 + monthlyRate, tenureMonths);
  return (targetEmi * (growth - 1)) / (monthlyRate * growth);
}

export function solveTenure(
  targetEmi: number,
  principal: number,
  annualRate: number
): number | null {
  if (targetEmi <= 0 || principal <= 0) return null;

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.ceil(principal / targetEmi);

  const firstInterest = principal * monthlyRate;
  if (targetEmi <= firstInterest) return null;

  const months =
    -Math.log(1 - (principal * monthlyRate) / targetEmi) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
}
