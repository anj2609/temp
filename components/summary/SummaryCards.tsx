"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { PrincipalInterestBar } from "./PrincipalInterestBar";
import { useEmiResult } from "@/hooks/useEmiResult";
import { formatRupees } from "@/lib/finance/format";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { AffordabilityGauge } from "./AffordabilityGauge";

interface StatProps {
  label: string;
  value: ReactNode;
  helper: string;
  emphasis?: boolean;
}

function Stat({ label, value, helper, emphasis }: StatProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-ink-muted">{label}</span>
      <p className="text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="text-xs text-ink-subtle">{helper}</p>
    </div>
  );
}

export function SummaryCards() {
  const summary = useEmiResult();

  return (
    <Card>
      <p className="sr-only" aria-live="polite">
        Monthly EMI {formatRupees(summary.emi)}. Total interest{" "}
        {formatRupees(summary.totalInterest)}. Total payable{" "}
        {formatRupees(summary.totalPayable)}.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 [&>*]:min-w-0">
        <Stat
          label="Monthly EMI"
          value={<RollingNumber value={summary.emi} format={formatRupees} />}
          helper="fixed payment every month"
          emphasis
        />
        <Stat
          label="Total interest"
          value={formatRupees(summary.totalInterest)}
          helper="cost of borrowing over the tenure"
        />
        <Stat
          label="Total payable"
          value={formatRupees(summary.totalPayable)}
          helper="principal plus total interest"
        />
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <PrincipalInterestBar
          principalPct={summary.principalSharePct}
          interestPct={summary.interestSharePct}
        />
      </div>
      <AffordabilityGauge />
    </Card>
  );
}
