"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { SyncedSliderInput } from "./SyncedSliderInput";
import { useEmiStore } from "@/store/useEmiStore";
import { LOAN_BOUNDS } from "@/types/domain";
import { formatRupees, formatPercent, formatMonths } from "@/lib/finance/format";

export function InputPanel() {
  const calculator = useEmiStore((s) => s.calculator);
  const setCalculatorInput = useEmiStore((s) => s.setCalculatorInput);

  return (
    <Card>
      <CardHeader title="Loan details" subtitle="Adjust the inputs to size your loan" />
      <div className="space-y-7">
        <SyncedSliderInput
          label="Loan amount"
          value={calculator.principal}
          onChange={(v) => setCalculatorInput("principal", v)}
          min={LOAN_BOUNDS.principal.min}
          max={LOAN_BOUNDS.principal.max}
          step={LOAN_BOUNDS.principal.step}
          formatValue={formatRupees}
          prefix="₹"
        />
        <SyncedSliderInput
          label="Annual interest rate"
          value={calculator.annualRate}
          onChange={(v) => setCalculatorInput("annualRate", v)}
          min={LOAN_BOUNDS.annualRate.min}
          max={LOAN_BOUNDS.annualRate.max}
          step={LOAN_BOUNDS.annualRate.step}
          formatValue={(v) => formatPercent(v, 0)}
          suffix="%"
        />
        <SyncedSliderInput
          label="Tenure"
          value={calculator.tenureMonths}
          onChange={(v) => setCalculatorInput("tenureMonths", v)}
          min={LOAN_BOUNDS.tenureMonths.min}
          max={LOAN_BOUNDS.tenureMonths.max}
          step={LOAN_BOUNDS.tenureMonths.step}
          formatValue={formatMonths}
          suffix="mo"
        />
      </div>
    </Card>
  );
}
