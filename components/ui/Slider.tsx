"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  className,
  ariaLabel,
}: SliderProps) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const clamped = Math.min(Math.max(value, min), max);
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stopWheel = (event: WheelEvent) => event.preventDefault();
    el.addEventListener("wheel", stopWheel, { passive: false });
    return () => el.removeEventListener("wheel", stopWheel);
  }, []);

  return (
    <input
      ref={ref}
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={clamped}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("h-[18px] w-full", className)}
      style={{
        ["--track" as string]: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--surface-muted) ${pct}%, var(--surface-muted) 100%)`,
      }}
    />
  );
}
