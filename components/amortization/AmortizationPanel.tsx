"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { AmortizationTable } from "./AmortizationTable";
import { AmortizationChart } from "./AmortizationChart";
import { ExportCsvButton } from "./ExportCsvButton";
import { useAmortizationSchedule } from "@/hooks/useAmortizationSchedule";
import { useLoanInsights } from "@/hooks/useLoanInsights";
import { useEmiStore } from "@/store/useEmiStore";

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
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-3 text-xs font-medium text-ink-muted">Loan insights</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {insights.map((insight) => (
              <div
                key={insight.key}
                className="rounded-xl bg-surface-muted px-3.5 py-3"
              >
                <p className="text-[11px] text-ink-subtle">{insight.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{insight.value}</p>
                <p className="mt-1 text-[10px] leading-snug text-ink-subtle">{insight.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
