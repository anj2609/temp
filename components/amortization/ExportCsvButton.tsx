"use client";

import type { AmortizationRow } from "@/types/domain";

interface ExportCsvButtonProps {
  rows: AmortizationRow[];
}

function toCsv(rows: AmortizationRow[]): string {
  const header = ["Month", "EMI", "Principal Paid", "Interest Paid", "Prepayment", "Balance"];
  const lines = rows.map((row) =>
    [
      row.month,
      Math.round(row.emi),
      Math.round(row.principalPaid),
      Math.round(row.interestPaid),
      Math.round(row.prepayment),
      Math.round(row.balance),
    ].join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function ExportCsvButton({ rows }: ExportCsvButtonProps) {
  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amortization-schedule.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={rows.length === 0}
      className="border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      Export CSV
    </button>
  );
}
