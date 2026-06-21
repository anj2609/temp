"use client";

import { memo, useEffect } from "react";
import { Pagination } from "./Pagination";
import { Badge } from "@/components/ui/Badge";
import { useEmiStore } from "@/store/useEmiStore";
import { formatRupees } from "@/lib/finance/format";
import type { AmortizationRow } from "@/types/domain";
import { cn } from "@/lib/cn";

const ROWS_PER_PAGE = 12;

interface RowProps {
  row: AmortizationRow;
  isBreakEven: boolean;
}

const ScheduleRow = memo(function ScheduleRow({ row, isBreakEven }: RowProps) {
  return (
    <tr className={cn(isBreakEven && "bg-accent-soft")}>
      <td className="px-2 py-2.5 font-medium text-ink sm:px-3">
        <span className="inline-flex items-center gap-1.5">
          {row.month}
          {isBreakEven ? (
            <Badge tone="accent" className="px-1.5 py-0 text-[9px] sm:px-2 sm:py-0.5 sm:text-xs">
              break-even
            </Badge>
          ) : null}
        </span>
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-ink sm:px-3">
        {formatRupees(row.emi)}
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-accent-ink sm:px-3">
        {formatRupees(row.principalPaid)}
        {row.prepayment > 0 ? (
          <span className="ml-1 text-[10px] text-accent">+pre</span>
        ) : null}
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-ink-muted sm:px-3">
        {formatRupees(row.interestPaid)}
      </td>
      <td className="hidden px-2 py-2.5 text-right tabular-nums text-ink sm:table-cell sm:px-3">
        {formatRupees(row.balance)}
      </td>
    </tr>
  );
});

interface AmortizationTableProps {
  rows: AmortizationRow[];
  breakEvenMonth: number | null;
}

export function AmortizationTable({ rows, breakEvenMonth }: AmortizationTableProps) {
  const page = useEmiStore((s) => s.amortizationPage);
  const setPage = useEmiStore((s) => s.setAmortizationPage);

  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const visible = rows.slice(start, start + ROWS_PER_PAGE);

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-subtle">
        No schedule to display for these inputs.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="-mx-2 overflow-x-auto px-2 scrollbar-slim">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wide text-ink-subtle sm:text-xs">
              <th className="px-2 py-2 text-left font-medium sm:px-3">Month</th>
              <th className="px-2 py-2 text-right font-medium sm:px-3">EMI</th>
              <th className="px-2 py-2 text-right font-medium sm:px-3">Principal</th>
              <th className="px-2 py-2 text-right font-medium sm:px-3">Interest</th>
              <th className="hidden px-2 py-2 text-right font-medium sm:table-cell sm:px-3">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => (
              <ScheduleRow
                key={row.month}
                row={row}
                isBreakEven={row.month === breakEvenMonth}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
