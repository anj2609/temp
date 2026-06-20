export type Mode = "single" | "compare" | "prepayment";

export type Theme = "light" | "dark";

export type ScenarioKey = "A" | "B" | "C";

export interface LoanInputs {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export interface Prepayment {
  id: string;
  month: number;
  amount: number;
}

export interface LoanSummary {
  emi: number;
  totalPayable: number;
  totalInterest: number;
  principalSharePct: number;
  interestSharePct: number;
}

export interface AmortizationRow {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  prepayment: number;
  balance: number;
}

export interface AmortizationResult {
  rows: AmortizationRow[];
  totalInterest: number;
  totalPrincipal: number;
  totalPaid: number;
}

export interface SensitivityCell {
  rate: number;
  tenure: number;
  emi: number;
  isCurrent: boolean;
}

export interface SensitivityGrid {
  rates: number[];
  tenures: number[];
  cells: SensitivityCell[][];
}

export interface PrepaymentPlan {
  schedule: AmortizationRow[];
  baselineSchedule: AmortizationRow[];
  interestSaved: number;
  tenureReduced: number;
  invalidPrepayments: Prepayment[];
}

export interface SharedState {
  mode: Mode;
  calculator: LoanInputs;
  scenarios: Record<ScenarioKey, LoanInputs>;
  prepayments: Prepayment[];
  theme: Theme;
}

export const LOAN_BOUNDS = {
  principal: { min: 10_000, max: 5_000_000, step: 1_000 },
  annualRate: { min: 1, max: 36, step: 0.1 },
  tenureMonths: { min: 1, max: 84, step: 1 },
} as const;
