"use client";

import { useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { SyncedSliderInput } from "./SyncedSliderInput";
import { useEmiStore, type SolveMode } from "@/store/useEmiStore";
import { LOAN_BOUNDS } from "@/types/domain";
import { solvePrincipal, solveTenure } from "@/lib/finance/solver";
import { formatRupees, formatPercent, formatMonths } from "@/lib/finance/format";

const BUDGET = { min: 1_000, max: 200_000, step: 500 };

function clampRound(value: number, min: number, max: number, step: number): number {
  const clamped = Math.min(Math.max(value, min), max);
  return Math.round(clamped / step) * step;
}

function ResultChip({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string | null;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-accent bg-accent-soft px-4 py-3">
      <p className="text-xs text-accent-ink">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {note ?? "Solved live from your inputs, synced to every tab."}
      </p>
    </div>
  );
}

export function InputPanel() {
  const calculator = useEmiStore((s) => s.calculator);
  const setCalculatorInput = useEmiStore((s) => s.setCalculatorInput);
  const solveMode = useEmiStore((s) => s.solveMode);
  const setSolveMode = useEmiStore((s) => s.setSolveMode);
  const solveBudget = useEmiStore((s) => s.solveBudget);
  const setSolveBudget = useEmiStore((s) => s.setSolveBudget);

  useEffect(() => {
    if (solveMode === "amount") {
      const solved = solvePrincipal(
        solveBudget,
        calculator.annualRate,
        calculator.tenureMonths
      );
      const next = clampRound(
        solved,
        LOAN_BOUNDS.principal.min,
        LOAN_BOUNDS.principal.max,
        LOAN_BOUNDS.principal.step
      );
      if (next !== calculator.principal) setCalculatorInput("principal", next);
    } else if (solveMode === "tenure") {
      const solved = solveTenure(solveBudget, calculator.principal, calculator.annualRate);
      if (solved !== null) {
        const next = Math.min(Math.max(solved, 1), LOAN_BOUNDS.tenureMonths.max);
        if (next !== calculator.tenureMonths) setCalculatorInput("tenureMonths", next);
      }
    }
  }, [solveMode, solveBudget, calculator, setCalculatorInput]);

  const tenureSolved =
    solveMode === "tenure"
      ? solveTenure(solveBudget, calculator.principal, calculator.annualRate)
      : null;

  const budgetSlider = (
    <SyncedSliderInput
      label="Monthly budget (EMI)"
      value={solveBudget}
      onChange={setSolveBudget}
      min={BUDGET.min}
      max={BUDGET.max}
      step={BUDGET.step}
      formatValue={formatRupees}
      prefix="₹"
    />
  );

  const amountSlider = (
    <SyncedSliderInput
      label="Loan amount"
      fieldId="calculator.principal"
      value={calculator.principal}
      onChange={(v) => setCalculatorInput("principal", v)}
      min={LOAN_BOUNDS.principal.min}
      max={LOAN_BOUNDS.principal.max}
      step={LOAN_BOUNDS.principal.step}
      formatValue={formatRupees}
      prefix="₹"
    />
  );

  const rateSlider = (
    <SyncedSliderInput
      label="Annual interest rate"
      fieldId="calculator.annualRate"
      value={calculator.annualRate}
      onChange={(v) => setCalculatorInput("annualRate", v)}
      min={LOAN_BOUNDS.annualRate.min}
      max={LOAN_BOUNDS.annualRate.max}
      step={LOAN_BOUNDS.annualRate.step}
      formatValue={(v) => formatPercent(v, 0)}
      suffix="%"
    />
  );

  const tenureSlider = (
    <SyncedSliderInput
      label="Tenure"
      fieldId="calculator.tenureMonths"
      value={calculator.tenureMonths}
      onChange={(v) => setCalculatorInput("tenureMonths", v)}
      min={LOAN_BOUNDS.tenureMonths.min}
      max={LOAN_BOUNDS.tenureMonths.max}
      step={LOAN_BOUNDS.tenureMonths.step}
      formatValue={formatMonths}
      suffix="mo"
    />
  );

  return (
    <Card>
      <CardHeader title="Loan details" subtitle="Pick what to solve for" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-muted">Solve for</span>
        <Toggle<SolveMode>
          value={solveMode}
          onChange={setSolveMode}
          size="sm"
          options={[
            { value: "emi", label: "EMI" },
            { value: "amount", label: "Amount" },
            { value: "tenure", label: "Tenure" },
          ]}
        />
      </div>

      <div className="space-y-7">
        {solveMode === "emi" ? (
          <>
            {amountSlider}
            {rateSlider}
            {tenureSlider}
          </>
        ) : null}

        {solveMode === "amount" ? (
          <>
            {budgetSlider}
            {rateSlider}
            {tenureSlider}
            <ResultChip
              label="Loan amount you can afford"
              value={formatRupees(calculator.principal)}
              note={null}
            />
          </>
        ) : null}

        {solveMode === "tenure" ? (
          <>
            {budgetSlider}
            {amountSlider}
            {rateSlider}
            <ResultChip
              label="Estimated payoff tenure"
              value={
                tenureSolved === null
                  ? "Not payable"
                  : formatMonths(Math.min(tenureSolved, LOAN_BOUNDS.tenureMonths.max))
              }
              note={
                tenureSolved === null
                  ? "Budget too low to cover the interest at this rate."
                  : tenureSolved > LOAN_BOUNDS.tenureMonths.max
                  ? `At this budget the loan needs about ${tenureSolved} months, capped at 84.`
                  : null
              }
            />
          </>
        ) : null}
      </div>
    </Card>
  );
}
