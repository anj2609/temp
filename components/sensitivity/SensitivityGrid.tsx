"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { useSensitivityGrid } from "@/hooks/useSensitivityGrid";
import { formatRupeesPlain, formatPercent } from "@/lib/finance/format";
import { cn } from "@/lib/cn";

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
        subtitle="EMI across nearby rates and tenures — current cell highlighted"
      />
      <div className="-mx-2 overflow-x-auto px-2 scrollbar-slim">
        <table className="w-full border-separate border-spacing-1 text-right text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left font-medium text-ink-subtle">
                Tenure \ Rate
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
                  {grid.tenures[rowIndex]} mo
                </th>
                {row.map((cell) => {
                  const intensity = (cell.emi - min) / span;
                  return (
                    <td
                      key={`${cell.tenure}-${cell.rate}`}
                      className={cn(
                        "rounded-lg px-2 py-1.5 tabular-nums transition-colors",
                        cell.isCurrent
                          ? "bg-accent font-semibold text-white ring-2 ring-accent"
                          : "text-ink"
                      )}
                      style={
                        cell.isCurrent
                          ? undefined
                          : {
                              backgroundColor: `color-mix(in srgb, var(--negative) ${Math.round(
                                intensity * 22
                              )}%, var(--surface-muted))`,
                            }
                      }
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
    </Card>
  );
}
