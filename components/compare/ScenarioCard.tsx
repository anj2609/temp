"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SyncedSliderInput } from "@/components/calculator/SyncedSliderInput";
import { LOAN_BOUNDS, type LoanInputs, type LoanSummary, type ScenarioKey } from "@/types/domain";
import { formatRupees, formatPercent, formatMonths } from "@/lib/finance/format";
import { cn } from "@/lib/cn";

interface ScenarioCardProps {
  scenarioKey: ScenarioKey;
  inputs: LoanInputs;
  summary: LoanSummary;
  isBest: boolean;
  onChange: (field: keyof LoanInputs, value: number) => void;
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className={strong ? "font-semibold text-ink" : "tabular-nums text-ink"}>
        {value}
      </span>
    </div>
  );
}

export function ScenarioCard({
  scenarioKey,
  inputs,
  summary,
  isBest,
  onChange,
}: ScenarioCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-5",
        isBest && "ring-2 ring-accent"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Scenario {scenarioKey}</h3>
        {isBest ? <Badge tone="accent">Lowest total cost</Badge> : null}
      </div>

      <div className="space-y-5">
        <SyncedSliderInput
          label="Amount"
          fieldId={`scenario.${scenarioKey}.principal`}
          value={inputs.principal}
          onChange={(v) => onChange("principal", v)}
          min={LOAN_BOUNDS.principal.min}
          max={LOAN_BOUNDS.principal.max}
          step={LOAN_BOUNDS.principal.step}
          formatValue={formatRupees}
          prefix="₹"
        />
        <SyncedSliderInput
          label="Rate"
          fieldId={`scenario.${scenarioKey}.annualRate`}
          value={inputs.annualRate}
          onChange={(v) => onChange("annualRate", v)}
          min={LOAN_BOUNDS.annualRate.min}
          max={LOAN_BOUNDS.annualRate.max}
          step={LOAN_BOUNDS.annualRate.step}
          formatValue={(v) => formatPercent(v, 0)}
          suffix="%"
        />
        <SyncedSliderInput
          label="Tenure"
          fieldId={`scenario.${scenarioKey}.tenureMonths`}
          value={inputs.tenureMonths}
          onChange={(v) => onChange("tenureMonths", v)}
          min={LOAN_BOUNDS.tenureMonths.min}
          max={LOAN_BOUNDS.tenureMonths.max}
          step={LOAN_BOUNDS.tenureMonths.step}
          formatValue={formatMonths}
          suffix="mo"
        />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <Metric label="Monthly EMI" value={formatRupees(summary.emi)} strong />
        <Metric label="Total interest" value={formatRupees(summary.totalInterest)} />
        <Metric label="Total payable" value={formatRupees(summary.totalPayable)} />
      </div>
    </Card>
  );
}
