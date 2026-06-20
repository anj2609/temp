import { useMemo } from "react";
import { useEmiStore } from "@/store/useEmiStore";
import { applyPrepaymentPlan } from "@/lib/finance/prepayment";
import type { PrepaymentPlan } from "@/types/domain";

export function usePrepaymentSavings(): PrepaymentPlan {
  const calculator = useEmiStore((s) => s.calculator);
  const prepayments = useEmiStore((s) => s.prepayments);

  return useMemo(
    () => applyPrepaymentPlan(calculator, prepayments),
    [calculator, prepayments]
  );
}
