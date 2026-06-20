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
      <td className="px-3 py-2.5 font-medium text-ink">
        <span className="inline-flex items-center gap-2">
          {row.month}
          {isBreakEven ? (
            <Badge tone="accent" className="px-2 py-0.5">
              break-even
            </Badge>
          ) : null}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-ink">
        {formatRupees(row.emi)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-accent-ink">
        {formatRupees(row.principalPaid)}
        {row.prepayment > 0 ? (
          <span className="ml-1 text-[10px] text-accent">+pre</span>
        ) : null}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">
        {formatRupees(row.interestPaid)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-ink">
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
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-subtle">
              <th className="px-3 py-2 text-left font-medium">Month</th>
              <th className="px-3 py-2 text-right font-medium">EMI</th>
              <th className="px-3 py-2 text-right font-medium">Principal</th>
              <th className="px-3 py-2 text-right font-medium">Interest</th>
              <th className="px-3 py-2 text-right font-medium">Balance</th>
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
