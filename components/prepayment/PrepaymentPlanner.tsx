"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PrepaymentForm } from "./PrepaymentForm";
import { PrepaymentList } from "./PrepaymentList";
import { usePrepaymentSavings } from "@/hooks/usePrepaymentSavings";
import { useEmiStore } from "@/store/useEmiStore";
import { formatRupees, formatMonths } from "@/lib/finance/format";

function SavingsStat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-subtle">{helper}</p>
    </div>
  );
}

export function PrepaymentPlanner() {
  const tenureMonths = useEmiStore((s) => s.calculator.tenureMonths);
  const plan = usePrepaymentSavings();
  const invalidIds = new Set(plan.invalidPrepayments.map((p) => p.id));
  const newTenure = plan.schedule.length;

  return (
    <Card>
      <CardHeader
        title="Prepayment planner"
        subtitle="Schedule lump-sum payments and watch interest melt away (reduce-tenure strategy)"
        action={
          plan.invalidPrepayments.length > 0 ? (
            <Badge tone="negative">
              {plan.invalidPrepayments.length} ignored beyond tenure
            </Badge>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SavingsStat
          label="New tenure"
          value={formatMonths(newTenure)}
          helper={`down from ${formatMonths(tenureMonths)}`}
        />
        <SavingsStat
          label="Interest saved"
          value={formatRupees(plan.interestSaved)}
          helper="vs the original plan"
        />
        <SavingsStat
          label="Months reduced"
          value={`${plan.tenureReduced}`}
          helper="loan finishes earlier"
        />
      </div>

      <div className="mt-6 space-y-5">
        <PrepaymentForm />
        <PrepaymentList invalidIds={invalidIds} />
      </div>
    </Card>
  );
}
