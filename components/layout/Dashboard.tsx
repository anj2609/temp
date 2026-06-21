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
    <div className="space-y-2">
      <SummaryCards />
      <SensitivityGrid />
    </div>
  );
}

export function Dashboard() {
  const mode = useEmiStore((s) => s.mode);

  return (
    <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-surface"
      >
        Skip to calculator
      </a>

      <Header />

      <div id="main-content" tabIndex={-1} className="mt-4 space-y-2 focus:outline-none">
        <ModeTabs />

        {mode === "single" ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <InputPanel />
            <HeadlinePanels />
          </div>
        ) : null}

        {mode === "prepayment" ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
            <PrepaymentPlanner />
            <HeadlinePanels />
          </div>
        ) : null}

        {mode === "compare" ? (
          <div className="space-y-2">
            <CompareMode />
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
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
