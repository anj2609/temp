"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AmortizationRow } from "@/types/domain";
import { formatRupees } from "@/lib/finance/format";

interface AmortizationChartProps {
  rows: AmortizationRow[];
}

export function AmortizationChart({ rows }: AmortizationChartProps) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-subtle">
        No schedule to chart for these inputs.
      </p>
    );
  }

  const data = rows.map((row) => ({
    month: row.month,
    principal: Math.round(row.principalPaid),
    interest: Math.round(row.interestPaid),
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--ink-subtle)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--ink-subtle)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-muted)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              color: "var(--ink)",
              fontSize: 12,
            }}
            formatter={(value: number, name) => [
              formatRupees(value),
              name === "principal" ? "Principal" : "Interest",
            ]}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Bar dataKey="principal" stackId="emi" fill="var(--accent)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="interest" stackId="emi" fill="var(--negative)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-ink-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Principal
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-negative" /> Interest
        </span>
      </div>
    </div>
  );
}
