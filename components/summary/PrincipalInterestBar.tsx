"use client";

import { formatPercent } from "@/lib/finance/format";

interface PrincipalInterestBarProps {
  principalPct: number;
  interestPct: number;
}

export function PrincipalInterestBar({
  principalPct,
  interestPct,
}: PrincipalInterestBarProps) {
  const principal = Math.max(0, Math.min(100, principalPct));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">Principal vs interest</span>
        <span className="text-ink-subtle">share of total payable</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${principal}%` }}
        />
        <div
          className="h-full bg-negative transition-all duration-300"
          style={{ width: `${100 - principal}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          Principal {formatPercent(principalPct)}
        </span>
        <span className="flex items-center gap-2 text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-negative" />
          Interest {formatPercent(interestPct)}
        </span>
      </div>
    </div>
  );
}
