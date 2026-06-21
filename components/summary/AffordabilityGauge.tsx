"use client";

import { useEffect, useRef, useState } from "react";
import { useEmiResult } from "@/hooks/useEmiResult";
import { formatRupees } from "@/lib/finance/format";

const STORAGE_KEY = "emi-monthly-income";

interface Ratio {
  pct: number;
  label: string;
  color: string;
}

function getRatio(emi: number, income: number): Ratio {
  const pct = Math.round((emi / income) * 100);
  if (pct <= 30) return { pct, label: "Healthy", color: "var(--positive)" };
  if (pct <= 50) return { pct, label: "Stretching", color: "var(--accent)" };
  return { pct, label: "Risky", color: "var(--negative)" };
}

export function AffordabilityGauge() {
  const { emi } = useEmiResult();
  const [income, setIncome] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && Number.isFinite(Number(saved)) && Number(saved) > 0) {
      const v = Number(saved);
      setIncome(v);
      setDraft(String(v));
    }
  }, []);

  const commit = () => {
    setFocused(false);
    const parsed = Number(draft);
    if (draft.trim() === "") {
      setIncome(null);
      localStorage.removeItem(STORAGE_KEY);
    } else if (Number.isFinite(parsed) && parsed > 0) {
      setIncome(parsed);
      localStorage.setItem(STORAGE_KEY, String(parsed));
    } else {
      setDraft(income ? String(income) : "");
    }
  };

  const ratio = income && income > 0 ? getRatio(emi, income) : null;

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-ink-muted">EMI affordability</span>
        <label className="flex items-center gap-1.5 bg-surface-muted px-2.5 py-1.5 ring-1 ring-transparent transition-shadow focus-within:ring-accent/60 cursor-text">
          <span className="flex-shrink-0 text-xs text-ink-subtle">₹</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            placeholder="Your monthly income"
            value={focused ? draft : income ? String(income) : ""}
            onFocus={() => {
              setFocused(true);
              setDraft(income ? String(income) : "");
            }}
            onBlur={commit}
            onChange={(e) => setDraft(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-36 bg-transparent text-xs text-ink tabular-nums outline-none placeholder:text-ink-subtle"
          />
        </label>
      </div>

      {ratio ? (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: ratio.color }}>
              {ratio.label}
            </span>
            <span className="tabular-nums text-xs text-ink-muted">
              {ratio.pct}% of {formatRupees(income!)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.min(ratio.pct, 100)}%`,
                backgroundColor: ratio.color,
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-ink-subtle">
            <span>0%</span>
            <span style={{ color: "var(--positive)" }}>≤30% safe</span>
            <span style={{ color: "var(--accent)" }}>≤50% ok</span>
            <span style={{ color: "var(--negative)" }}>50%+</span>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-ink-subtle">
          Enter your net monthly income to see if this EMI fits your budget.
        </p>
      )}
    </div>
  );
}
