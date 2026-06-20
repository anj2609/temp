import type { LoanInputs, LoanSummary, ScenarioKey } from "@/types/domain";
import { calculateLoanSummary } from "./emi";

export function summarizeScenarios(
  scenarios: Record<ScenarioKey, LoanInputs>
): Record<ScenarioKey, LoanSummary> {
  return {
    A: calculateLoanSummary(scenarios.A),
    B: calculateLoanSummary(scenarios.B),
    C: calculateLoanSummary(scenarios.C),
  };
}

export function pickBestScenario(
  summaries: Record<ScenarioKey, LoanSummary>
): ScenarioKey | null {
  let best: ScenarioKey | null = null;
  let lowest = Infinity;

  for (const key of Object.keys(summaries) as ScenarioKey[]) {
    const { totalPayable, emi } = summaries[key];
    if (emi <= 0 || totalPayable <= 0) continue;
    if (totalPayable < lowest) {
      lowest = totalPayable;
      best = key;
    }
  }

  return best;
}
