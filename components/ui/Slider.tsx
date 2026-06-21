"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onRelease?: () => void;
  className?: string;
  ariaLabel?: string;
  ariaValueText?: string;
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  onRelease,
  className,
  ariaLabel,
  ariaValueText,
}: SliderProps) {
  const ref = useRef<HTMLInputElement>(null);
  const clamped = Math.min(Math.max(value, min), max);
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stopWheel = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", stopWheel, { passive: false });
    return () => el.removeEventListener("wheel", stopWheel);
  }, []);

  return (
    <div className={cn("relative h-[18px] w-full select-none", className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onRelease}
        onPointerCancel={onRelease}
        onBlur={onRelease}
        onKeyUp={onRelease}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />

      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-[60ms] ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface shadow-sm transition-[left,box-shadow] duration-[60ms] ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}
