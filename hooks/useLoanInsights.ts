import { useMemo } from "react";
import { useAmortizationSchedule } from "./useAmortizationSchedule";
import { useEmiStore } from "@/store/useEmiStore";
import { formatRupees } from "@/lib/finance/format";

export interface LoanInsight {
  key: string;
  label: string;
  value: string;
  sub: string;
}

export function useLoanInsights(): LoanInsight[] {
  const { rows, totalInterest, totalPrincipal } = useAmortizationSchedule();
  const principal = useEmiStore((s) => s.calculator.principal);

  return useMemo(() => {
    if (!rows.length) return [];

    const insights: LoanInsight[] = [];

    const interestRatioPct = ((totalInterest / totalPrincipal) * 100).toFixed(1);
    const per1k = Math.round((totalInterest / principal) * 1000);
    insights.push({
      key: "cost",
      label: "Interest cost",
      value: `${interestRatioPct}% of principal`,
      sub: `${formatRupees(per1k)} paid in interest per ₹1,000 borrowed`,
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
        label: "Half-principal month",
        value: `Month ${halfMonth}`,
        sub: `50% of principal cleared by month ${halfMonth} of ${rows.length}`,
      });
    }

    const firstInterest = rows[0]?.interestPaid ?? 0;
    const lastInterest = rows[rows.length - 1]?.interestPaid ?? 0;
    const drop = Math.round(((firstInterest - lastInterest) / firstInterest) * 100);
    insights.push({
      key: "trend",
      label: "Interest in EMI",
      value: `${drop}% lower by end`,
      sub: `Drops from ${formatRupees(firstInterest)} (month 1) to ${formatRupees(lastInterest)} (final month)`,
    });

    return insights;
  }, [rows, totalInterest, totalPrincipal, principal]);
}
