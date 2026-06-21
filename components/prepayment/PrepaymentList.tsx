"use client";

import { Badge } from "@/components/ui/Badge";
import { useEmiStore } from "@/store/useEmiStore";
import { formatRupees } from "@/lib/finance/format";
import type { Prepayment } from "@/types/domain";

interface PrepaymentListProps {
  invalidIds: Set<string>;
}

export function PrepaymentList({ invalidIds }: PrepaymentListProps) {
  const prepayments = useEmiStore((s) => s.prepayments);
  const removePrepayment = useEmiStore((s) => s.removePrepayment);

  if (prepayments.length === 0) {
    return (
      <p className="border border-dashed border-border px-4 py-6 text-center text-sm text-ink-subtle">
        No prepayments scheduled yet. Add a lump-sum above to see the savings.
      </p>
    );
  }

  const sorted = [...prepayments].sort((a, b) => a.month - b.month);

  return (
    <ul className="space-y-2">
      {sorted.map((p: Prepayment) => {
        const invalid = invalidIds.has(p.id);
        return (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 border border-border bg-surface-muted px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-surface text-xs font-semibold text-ink-muted">
                M{p.month}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{formatRupees(p.amount)}</p>
                <p className="text-xs text-ink-subtle">applied in month {p.month}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {invalid ? <Badge tone="negative">out of range</Badge> : null}
              <button
                type="button"
                onClick={() => removePrepayment(p.id)}
                aria-label="Remove prepayment"
                className="border border-border px-2.5 py-1 text-xs text-ink-muted transition-colors hover:text-negative"
              >
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
