"use client";

import { Slider } from "@/components/ui/Slider";
import { NumberField } from "@/components/ui/NumberField";

interface SyncedSliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  prefix?: string;
  suffix?: string;
}

export function SyncedSliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  prefix,
  suffix,
}: SyncedSliderInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        <NumberField
          value={value}
          onCommit={onChange}
          min={min}
          max={max}
          step={step}
          prefix={prefix}
          suffix={suffix}
          ariaLabel={label}
          className="w-36"
        />
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        ariaLabel={`${label} slider`}
      />
      <div className="flex justify-between text-xs text-ink-subtle">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
