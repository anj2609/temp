"use client";

import { useEffect, type ReactNode } from "react";
import { selectShared, useEmiStore } from "@/store/useEmiStore";
import { usePresenceStore } from "@/hooks/useTabPresence";
import { useLiveActivityStore } from "@/hooks/useLiveActivity";
import { readPersistedState } from "@/store/persistMiddleware";
import { initSync } from "@/lib/sync";
import { useToastStore } from "@/hooks/useToastStore";
import { Toaster } from "@/components/ui/Toaster";
import { useScrollSync } from "@/hooks/useScrollSync";
import { LOAN_BOUNDS, type Mode, type SharedState } from "@/types/domain";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function readUrlSeed(): { calculator: Partial<SharedState["calculator"]>; mode?: Mode } {
  if (typeof window === "undefined") return { calculator: {} };
  const params = new URLSearchParams(window.location.search);
  const calculator: Partial<SharedState["calculator"]> = {};

  const amount = params.get("amount");
  const rate = params.get("rate");
  const tenure = params.get("tenure");
  const mode = params.get("mode");

  if (amount && Number.isFinite(Number(amount))) {
    calculator.principal = clamp(
      Number(amount),
      LOAN_BOUNDS.principal.min,
      LOAN_BOUNDS.principal.max
    );
  }
  if (rate && Number.isFinite(Number(rate))) {
    calculator.annualRate = clamp(
      Number(rate),
      LOAN_BOUNDS.annualRate.min,
      LOAN_BOUNDS.annualRate.max
    );
  }
  if (tenure && Number.isFinite(Number(tenure))) {
    calculator.tenureMonths = clamp(
      Number(tenure),
      LOAN_BOUNDS.tenureMonths.min,
      LOAN_BOUNDS.tenureMonths.max
    );
  }

  const validMode: Mode | undefined =
    mode === "single" || mode === "compare" || mode === "prepayment" ? mode : undefined;

  return { calculator, mode: validMode };
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const persisted = readPersistedState();
    const seed = readUrlSeed();
    const base = persisted ?? selectShared(useEmiStore.getState());

    const merged: SharedState = {
      ...base,
      mode: seed.mode ?? base.mode,
      calculator: { ...base.calculator, ...seed.calculator },
    };
    useEmiStore.getState().hydrateFromStorage(merged);

    const teardown = initSync({
      onRemoteState: (state, sourceTabId) => {
        const current = selectShared(useEmiStore.getState());
        const add = useToastStore.getState().add;
        const { principal, annualRate, tenureMonths } = state.calculator;
        const c = current.calculator;

        if (Math.abs(principal - c.principal) > c.principal * 0.001) {
          add({ message: "changed loan amount", tabId: sourceTabId });
        } else if (Math.abs(annualRate - c.annualRate) > 0.005) {
          add({ message: "changed interest rate", tabId: sourceTabId });
        } else if (tenureMonths !== c.tenureMonths) {
          add({ message: "changed tenure", tabId: sourceTabId });
        } else if (state.mode !== current.mode) {
          add({ message: `switched to ${state.mode} mode`, tabId: sourceTabId });
        } else if (state.theme !== current.theme) {
          add({ message: "toggled theme", tabId: sourceTabId });
        }

        useEmiStore.getState().hydrateFromRemote(state);
      },
      onPresence: (info) => usePresenceStore.getState().setPresence(info),
      onActivity: (activity) => useLiveActivityStore.getState().apply(activity),
      getState: () => selectShared(useEmiStore.getState()),
    });

    const prune = setInterval(() => useLiveActivityStore.getState().prune(), 600);

    return () => {
      clearInterval(prune);
      teardown();
    };
  }, []);

  useEffect(() => {
    const apply = (theme: string) =>
      document.documentElement.setAttribute("data-theme", theme);
    apply(useEmiStore.getState().theme);
    return useEmiStore.subscribe((state) => apply(state.theme));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useEmiStore.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("amount", String(state.calculator.principal));
        params.set("rate", String(state.calculator.annualRate));
        params.set("tenure", String(state.calculator.tenureMonths));
        params.set("mode", state.mode);
        const nextSearch = `?${params.toString()}`;
        if (nextSearch !== window.location.search) {
          window.history.replaceState(window.history.state, "", nextSearch);
        }
      }, 200);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) useEmiStore.getState().redo();
        else useEmiStore.getState().undo();
      } else if (key === "y") {
        event.preventDefault();
        useEmiStore.getState().redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useScrollSync();

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
