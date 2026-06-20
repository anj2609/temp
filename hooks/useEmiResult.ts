import { useMemo } from "react";
import { useEmiStore } from "@/store/useEmiStore";
import { calculateLoanSummary } from "@/lib/finance/emi";
import type { LoanSummary } from "@/types/domain";

export function useEmiResult(): LoanSummary {
  const calculator = useEmiStore((s) => s.calculator);
  return useMemo(() => calculateLoanSummary(calculator), [calculator]);
}
