"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { AmortizationTable } from "./AmortizationTable";
import { AmortizationChart } from "./AmortizationChart";
import { ExportCsvButton } from "./ExportCsvButton";
import { useAmortizationSchedule } from "@/hooks/useAmortizationSchedule";
import { useLoanInsights, type LoanInsight } from "@/hooks/useLoanInsights";
import { useEmiStore } from "@/store/useEmiStore";
import { ScaleIcon, ClockIcon, TrendingDownIcon } from "@/components/ui/icons";

const INSIGHT_ICON = {
  cost: ScaleIcon,
  half: ClockIcon,
  trend: TrendingDownIcon,
} as const;

function InsightCard({ insight }: { insight: LoanInsight }) {
  const Icon = INSIGHT_ICON[insight.icon];
  const pct = Math.round(Math.min(Math.max(insight.meter, 0), 1) * 100);

  return (
    <div className="group rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
          <Icon size={16} />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
          {insight.label}
        </span>
      </div>

      <p className="mt-3 text-xl font-semibold tracking-tight text-ink">{insight.value}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{insight.sub}</p>

      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] uppercase tracking-wide text-ink-subtle">
          {insight.meterCaption}
        </p>
      </div>
    </div>
  );
}

export function AmortizationPanel() {
  const { rows, breakEvenMonth } = useAmortizationSchedule();
  const insights = useLoanInsights();
  const view = useEmiStore((s) => s.amortizationView);
  const setView = useEmiStore((s) => s.setAmortizationView);

  return (
    <Card>
      <CardHeader
        title="Amortization schedule"
        subtitle="Month-by-month split of every EMI into principal and interest"
        action={
          <div className="flex items-center gap-2">
            <ExportCsvButton rows={rows} />
            <Toggle
              value={view}
              onChange={setView}
              size="sm"
              options={[
                { value: "table", label: "Table" },
                { value: "chart", label: "Chart" },
              ]}
            />
          </div>
        }
      />
      {breakEvenMonth ? (
        <div className="mb-4">
          <Badge tone="accent">
            Break-even at month {breakEvenMonth}, principal repaid overtakes interest
          </Badge>
        </div>
      ) : null}
      {view === "table" ? (
        <AmortizationTable rows={rows} breakEvenMonth={breakEvenMonth} />
      ) : (
        <AmortizationChart rows={rows} />
      )}

      {insights.length > 0 && (
        <div className="mt-5 border-t border-border pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Loan insights</p>
            <span className="text-[11px] text-ink-subtle">auto-generated from your schedule</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.key} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
