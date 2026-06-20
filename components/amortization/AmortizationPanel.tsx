"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { AmortizationTable } from "./AmortizationTable";
import { AmortizationChart } from "./AmortizationChart";
import { ExportCsvButton } from "./ExportCsvButton";
import { useAmortizationSchedule } from "@/hooks/useAmortizationSchedule";
import { useEmiStore } from "@/store/useEmiStore";

export function AmortizationPanel() {
  const { rows, breakEvenMonth } = useAmortizationSchedule();
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
            Break-even at month {breakEvenMonth} — principal repaid overtakes interest
          </Badge>
        </div>
      ) : null}
      {view === "table" ? (
        <AmortizationTable rows={rows} breakEvenMonth={breakEvenMonth} />
      ) : (
        <AmortizationChart rows={rows} />
      )}
    </Card>
  );
}
