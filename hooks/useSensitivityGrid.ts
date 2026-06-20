import { useMemo } from "react";
import { useEmiStore } from "@/store/useEmiStore";
import { buildSensitivityGrid } from "@/lib/finance/sensitivity";
import type { SensitivityGrid } from "@/types/domain";

export function useSensitivityGrid(): SensitivityGrid {
  const principal = useEmiStore((s) => s.calculator.principal);
  const annualRate = useEmiStore((s) => s.calculator.annualRate);
  const tenureMonths = useEmiStore((s) => s.calculator.tenureMonths);

  return useMemo(
    () => buildSensitivityGrid(principal, annualRate, tenureMonths),
    [principal, annualRate, tenureMonths]
  );
}
