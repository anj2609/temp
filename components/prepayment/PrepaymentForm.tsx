"use client";

import { useState } from "react";
import { NumberField } from "@/components/ui/NumberField";
import { useEmiStore } from "@/store/useEmiStore";

export function PrepaymentForm() {
  const tenureMonths = useEmiStore((s) => s.calculator.tenureMonths);
  const addPrepayment = useEmiStore((s) => s.addPrepayment);

  const [month, setMonth] = useState(12);
  const [amount, setAmount] = useState(100_000);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!Number.isFinite(month) || month < 1 || month > tenureMonths) {
      setError(`Month must be between 1 and ${tenureMonths}.`);
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    setError(null);
    addPrepayment(Math.round(month), Math.round(amount));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <label className="min-w-0 space-y-1.5 text-sm">
          <span className="text-ink-muted">Month</span>
          <NumberField value={month} onCommit={setMonth} min={1} max={tenureMonths} step={1} />
        </label>
        <label className="min-w-0 space-y-1.5 text-sm">
          <span className="text-ink-muted">Amount</span>
          <NumberField value={amount} onCommit={setAmount} min={1} step={1000} prefix="₹" />
        </label>
        <button
          type="button"
          onClick={submit}
          className="h-[42px] bg-ink px-5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Add
        </button>
      </div>
      {error ? <p className="text-xs text-negative">{error}</p> : null}
    </div>
  );
}
