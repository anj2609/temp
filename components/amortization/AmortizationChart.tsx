"use client";

import {
  Area,
  AreaChart,
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
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--negative)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--negative)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--ink-subtle)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--ink-subtle)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.625rem",
              color: "var(--ink)",
              fontSize: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number, name) => [
              formatRupees(value),
              name === "principal" ? "Principal" : "Interest",
            ]}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Area
            type="monotone"
            dataKey="principal"
            stackId="a"
            stroke="var(--accent)"
            strokeWidth={1.5}
            fill="url(#gradPrincipal)"
            dot={false}
            activeDot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="interest"
            stackId="a"
            stroke="var(--negative)"
            strokeWidth={1.5}
            fill="url(#gradInterest)"
            dot={false}
            activeDot={{ r: 3, fill: "var(--negative)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Principal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-negative" /> Interest
        </span>
      </div>
    </div>
  );
}
