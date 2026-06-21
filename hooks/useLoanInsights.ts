import { useMemo } from "react";
import { useAmortizationSchedule } from "./useAmortizationSchedule";
import { useEmiStore } from "@/store/useEmiStore";
import { formatRupees } from "@/lib/finance/format";

export type InsightIcon = "cost" | "half" | "trend";

export interface LoanInsight {
  key: string;
  icon: InsightIcon;
  label: string;
  value: string;
  sub: string;
  meter: number;
  meterCaption: string;
}

export function useLoanInsights(): LoanInsight[] {
  const { rows, totalInterest, totalPrincipal } = useAmortizationSchedule();
  const principal = useEmiStore((s) => s.calculator.principal);

  return useMemo(() => {
    if (!rows.length) return [];

    const insights: LoanInsight[] = [];
    const totalPayable = totalInterest + totalPrincipal;

    const interestRatioPct = ((totalInterest / totalPrincipal) * 100).toFixed(1);
    const per1k = Math.round((totalInterest / principal) * 1000);
    insights.push({
      key: "cost",
      icon: "cost",
      label: "Interest cost",
      value: `${interestRatioPct}%`,
      sub: `${formatRupees(per1k)} in interest per ₹1,000 borrowed`,
      meter: totalPayable > 0 ? totalInterest / totalPayable : 0,
      meterCaption: "share of total payable",
    });

    let cumPrincipal = 0;
    let halfMonth: number | null = null;
    for (const row of rows) {
      cumPrincipal += row.principalPaid;
      if (!halfMonth && cumPrincipal >= totalPrincipal * 0.5) {
        halfMonth = row.month;
      }
    }
    if (halfMonth) {
      insights.push({
        key: "half",
        icon: "half",
        label: "Halfway point",
        value: `Month ${halfMonth}`,
        sub: `Half the principal is cleared by month ${halfMonth} of ${rows.length}`,
        meter: halfMonth / rows.length,
        meterCaption: `${halfMonth} / ${rows.length} months`,
      });
    }

    const firstInterest = rows[0]?.interestPaid ?? 0;
    const lastInterest = rows[rows.length - 1]?.interestPaid ?? 0;
    const drop = firstInterest > 0 ? Math.round(((firstInterest - lastInterest) / firstInterest) * 100) : 0;
    insights.push({
      key: "trend",
      icon: "trend",
      label: "Interest in each EMI",
      value: `${drop}% lower`,
      sub: `From ${formatRupees(firstInterest)} in month 1 to ${formatRupees(lastInterest)} at the end`,
      meter: drop / 100,
      meterCaption: "first vs final EMI",
    });

    return insights;
  }, [rows, totalInterest, totalPrincipal, principal]);
}
