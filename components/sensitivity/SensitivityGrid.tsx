"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { useSensitivityGrid } from "@/hooks/useSensitivityGrid";
import { formatRupeesPlain, formatPercent } from "@/lib/finance/format";
import { cn } from "@/lib/cn";

const HEAT_STOPS = [
  [111, 174, 140],
  [220, 165, 106],
  [217, 138, 142],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function heatColor(t: number): string {
  const clamped = Math.min(Math.max(t, 0), 1);
  const segment = clamped < 0.5 ? 0 : 1;
  const k = clamped < 0.5 ? clamped / 0.5 : (clamped - 0.5) / 0.5;
  const a = HEAT_STOPS[segment];
  const b = HEAT_STOPS[segment + 1];
  return `rgb(${Math.round(lerp(a[0], b[0], k))}, ${Math.round(
    lerp(a[1], b[1], k)
  )}, ${Math.round(lerp(a[2], b[2], k))})`;
}

export function SensitivityGrid() {
  const grid = useSensitivityGrid();

  const values = grid.cells.flat().map((c) => c.emi);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return (
    <Card>
      <CardHeader
        title="What-if sensitivity"
        subtitle="EMI for nearby rates and tenures. The current loan sits at the centre."
      />

      <div className="-mx-2 overflow-x-auto px-2 scrollbar-slim">
        <table className="w-full border-separate border-spacing-1 text-right text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left font-medium text-ink-subtle">
                mo \ rate
              </th>
              {grid.rates.map((rate) => (
                <th
                  key={rate}
                  className="px-2 py-1 font-medium text-ink-muted tabular-nums"
                >
                  {formatPercent(rate, rate % 1 === 0 ? 0 : 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.cells.map((row, rowIndex) => (
              <tr key={grid.tenures[rowIndex]}>
                <th className="whitespace-nowrap px-2 py-1 text-left font-medium text-ink-muted tabular-nums">
                  {grid.tenures[rowIndex]}
                </th>
                {row.map((cell) => {
                  const intensity = (cell.emi - min) / span;
                  return (
                    <td
                      key={`${cell.tenure}-${cell.rate}`}
                      className={cn(
                        "rounded-lg px-2 py-1.5 tabular-nums transition-transform",
                        cell.isCurrent
                          ? "font-semibold text-surface ring-2 ring-ink"
                          : "font-medium text-ink hover:scale-[1.04]"
                      )}
                      style={{
                        backgroundColor: cell.isCurrent
                          ? "var(--ink)"
                          : `color-mix(in srgb, ${heatColor(intensity)} 42%, var(--surface))`,
                      }}
                    >
                      {formatRupeesPlain(cell.emi)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-ink-subtle">
        <span>lower EMI</span>
        <span
          className="h-2 flex-1 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgb(111,174,140), rgb(220,165,106), rgb(217,138,142))",
          }}
        />
        <span>higher EMI</span>
      </div>
    </Card>
  );
}
