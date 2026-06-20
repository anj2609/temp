"use client";

import { useMemo } from "react";
import { Slider } from "@/components/ui/Slider";
import { NumberField } from "@/components/ui/NumberField";
import { useFieldGhost } from "@/hooks/useLiveActivity";
import { broadcastActivity } from "@/lib/sync";
import { shortTabId, tabColor } from "@/lib/sync/tabIdentity";
import { throttle } from "@/lib/throttle";

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
  fieldId?: string;
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
  fieldId,
}: SyncedSliderInputProps) {
  const ghost = useFieldGhost(fieldId);

  const emitActivity = useMemo(
    () =>
      throttle((next: number) => {
        if (fieldId) broadcastActivity(fieldId, next);
      }, 70),
    [fieldId]
  );

  const handleChange = (next: number) => {
    onChange(next);
    if (fieldId) emitActivity(next);
  };

  const release = () => {
    if (fieldId) broadcastActivity(fieldId, null);
  };

  const ghostPct =
    ghost && max > min
      ? ((Math.min(Math.max(ghost.value, min), max) - min) / (max - min)) * 100
      : null;
  const ghostColor = ghost ? tabColor(ghost.tabId) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        <NumberField
          value={value}
          onCommit={(next) => {
            handleChange(next);
            release();
          }}
          min={min}
          max={max}
          step={step}
          prefix={prefix}
          suffix={suffix}
          ariaLabel={label}
          className="w-36"
        />
      </div>

      <div className="relative">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          onRelease={release}
          ariaLabel={`${label} slider`}
        />
        {ghostPct !== null ? (
          <>
            <span
              className="pointer-events-none absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
              style={{ left: `${ghostPct}%`, backgroundColor: ghostColor }}
            />
            <span
              className="pointer-events-none absolute -top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ left: `${ghostPct}%`, backgroundColor: ghostColor }}
            >
              Tab #{shortTabId(ghost!.tabId)}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex justify-between text-xs text-ink-subtle">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
