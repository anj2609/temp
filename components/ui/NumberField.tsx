"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface NumberFieldProps {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
  className?: string;
}

export function NumberField({
  value,
  onCommit,
  min,
  max,
  step,
  prefix,
  suffix,
  ariaLabel,
  className,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) onCommit(parsed);
    else setDraft(String(value));
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm font-medium text-ink focus-within:border-accent",
        className
      )}
    >
      {prefix ? <span className="text-ink-subtle">{prefix}</span> : null}
      <input
        type="number"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full bg-transparent text-right tabular-nums outline-none"
      />
      {suffix ? <span className="text-ink-subtle">{suffix}</span> : null}
    </div>
  );
}
