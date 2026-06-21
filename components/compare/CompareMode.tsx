"use client";

import { ScenarioCard } from "./ScenarioCard";
import { useBestScenario } from "@/hooks/useBestScenario";
import { useEmiStore } from "@/store/useEmiStore";
import type { ScenarioKey } from "@/types/domain";

const KEYS: ScenarioKey[] = ["A", "B", "C"];

export function CompareMode() {
  const scenarios = useEmiStore((s) => s.scenarios);
  const setScenarioInput = useEmiStore((s) => s.setScenarioInput);
  const { summaries, best } = useBestScenario();

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
      {KEYS.map((key) => (
        <ScenarioCard
          key={key}
          scenarioKey={key}
          inputs={scenarios[key]}
          summary={summaries[key]}
          isBest={best === key}
          onChange={(field, value) => setScenarioInput(key, field, value)}
        />
      ))}
    </div>
  );
}
