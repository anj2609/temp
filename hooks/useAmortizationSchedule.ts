import { useMemo } from "react";
import { useEmiStore } from "@/store/useEmiStore";
import {
  buildAmortizationSchedule,
  findBreakEvenMonth,
} from "@/lib/finance/amortization";
import type { AmortizationResult } from "@/types/domain";

export interface AmortizationView extends AmortizationResult {
  breakEvenMonth: number | null;
}

export function useAmortizationSchedule(): AmortizationView {
  const calculator = useEmiStore((s) => s.calculator);
  const prepayments = useEmiStore((s) => s.prepayments);

  return useMemo(() => {
    const result = buildAmortizationSchedule(calculator, prepayments);
    return { ...result, breakEvenMonth: findBreakEvenMonth(result.rows) };
  }, [calculator, prepayments]);
}
