"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const DIGITS = "0123456789";

function RollingDigit({ char }: { char: string }) {
  if (!DIGITS.includes(char)) {
    return <span style={{ display: "inline" }}>{char}</span>;
  }
  const n = parseInt(char, 10);
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: "1em",
        lineHeight: "1",
        verticalAlign: "text-bottom",
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${-n * 10}%)`,
          transition: "transform 260ms cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      >
        {DIGITS.split("").map((d) => (
          <span
            key={d}
            style={{
              height: "1em",
              lineHeight: "1",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

interface RollingNumberProps {
  value: number;
  format: (v: number) => string;
  className?: string;
}

export function RollingNumber({ value, format, className }: RollingNumberProps) {
  const prevRef = useRef<number | null>(null);
  const [flashColor, setFlashColor] = useState<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = value;
      return;
    }
    if (prevRef.current === value) return;
    const isDown = value < prevRef.current;
    prevRef.current = value;
    setFlashColor(isDown ? "var(--positive)" : "var(--negative)");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlashColor(undefined), 650);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const formatted = format(value);
  const chars = formatted.split("");

  return (
    <span
      role="text"
      aria-label={formatted}
      className={cn("inline-flex items-baseline", className)}
      style={{
        color: flashColor,
        transition: flashColor === undefined ? "color 550ms ease-out" : undefined,
      }}
    >
      {chars.map((char, i) => (
        <RollingDigit key={chars.length - 1 - i} char={char} />
      ))}
    </span>
  );
}
