import { useMemo } from "react";
import { useEmiStore } from "@/store/useEmiStore";
import { pickBestScenario, summarizeScenarios } from "@/lib/finance/comparison";
import type { LoanSummary, ScenarioKey } from "@/types/domain";

export interface ScenarioComparison {
  summaries: Record<ScenarioKey, LoanSummary>;
  best: ScenarioKey | null;
}

export function useBestScenario(): ScenarioComparison {
  const scenarios = useEmiStore((s) => s.scenarios);

  return useMemo(() => {
    const summaries = summarizeScenarios(scenarios);
    return { summaries, best: pickBestScenario(summaries) };
  }, [scenarios]);
}
