"use client";

import { Header } from "./Header";
import { ModeTabs } from "./ModeTabs";
import { InputPanel } from "@/components/calculator/InputPanel";
import { SummaryCards } from "@/components/summary/SummaryCards";
import { SensitivityGrid } from "@/components/sensitivity/SensitivityGrid";
import { AmortizationPanel } from "@/components/amortization/AmortizationPanel";
import { CompareMode } from "@/components/compare/CompareMode";
import { PrepaymentPlanner } from "@/components/prepayment/PrepaymentPlanner";
import { useEmiStore } from "@/store/useEmiStore";

function HeadlinePanels() {
  return (
    <div className="space-y-5">
      <SummaryCards />
      <SensitivityGrid />
    </div>
  );
}

export function Dashboard() {
  const mode = useEmiStore((s) => s.mode);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Header />

      <div className="mt-6 space-y-5">
        <ModeTabs />

        {mode === "single" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <InputPanel />
            <HeadlinePanels />
          </div>
        ) : null}

        {mode === "prepayment" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
            <PrepaymentPlanner />
            <HeadlinePanels />
          </div>
        ) : null}

        {mode === "compare" ? (
          <div className="space-y-5">
            <CompareMode />
            <div className="grid gap-5 lg:grid-cols-2">
              <SummaryCards />
              <SensitivityGrid />
            </div>
          </div>
        ) : null}

        <AmortizationPanel />
      </div>
    </main>
  );
}
