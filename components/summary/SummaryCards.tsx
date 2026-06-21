"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { PrincipalInterestBar } from "./PrincipalInterestBar";
import { useEmiResult } from "@/hooks/useEmiResult";
import { formatRupees } from "@/lib/finance/format";
import { ReceiptIcon, TrendingUpIcon, WalletIcon } from "@/components/ui/icons";

type Tone = "accent" | "negative" | "neutral";

const toneTile: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent-ink",
  negative: "bg-negative-soft text-negative",
  neutral: "bg-surface-muted text-ink-muted",
};

interface StatProps {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone: Tone;
  emphasis?: boolean;
}

function Stat({ label, value, helper, icon, tone, emphasis }: StatProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneTile[tone]}`}
        >
          {icon}
        </span>
        <span className="text-sm text-ink-muted">{label}</span>
      </div>
      <div>
        <p
          className={
            emphasis
              ? "text-3xl font-semibold tracking-tight text-ink"
              : "text-2xl font-semibold tracking-tight text-ink"
          }
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-ink-subtle">{helper}</p>
      </div>
    </div>
  );
}

export function SummaryCards() {
  const summary = useEmiResult();

  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Stat
          label="Monthly EMI"
          value={formatRupees(summary.emi)}
          helper="fixed payment every month"
          tone="accent"
          emphasis
          icon={<WalletIcon size={16} />}
        />
        <Stat
          label="Total interest"
          value={formatRupees(summary.totalInterest)}
          helper="cost of borrowing over the tenure"
          tone="negative"
          icon={<TrendingUpIcon size={16} />}
        />
        <Stat
          label="Total payable"
          value={formatRupees(summary.totalPayable)}
          helper="principal plus total interest"
          tone="neutral"
          icon={<ReceiptIcon size={16} />}
        />
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <PrincipalInterestBar
          principalPct={summary.principalSharePct}
          interestPct={summary.interestSharePct}
        />
      </div>
    </Card>
  );
}
