import { create } from "zustand";
import {
  LOAN_BOUNDS,
  type LoanInputs,
  type Mode,
  type ScenarioKey,
  type SharedState,
  type Theme,
} from "@/types/domain";
import { persistMiddleware } from "./persistMiddleware";
import { syncMiddleware } from "./syncMiddleware";

type Origin = "init" | "local" | "remote" | "storage" | "ui";

export interface UiPreferences {
  amortizationView: "table" | "chart";
  amortizationPage: number;
}

export interface EmiStore extends SharedState, UiPreferences {
  _origin: Origin;
  _past: SharedState[];
  _future: SharedState[];

  setCalculatorInput: (field: keyof LoanInputs, value: number) => void;
  setScenarioInput: (key: ScenarioKey, field: keyof LoanInputs, value: number) => void;
  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  addPrepayment: (month: number, amount: number) => void;
  updatePrepayment: (id: string, patch: Partial<{ month: number; amount: number }>) => void;
  removePrepayment: (id: string) => void;
  clearPrepayments: () => void;

  setAmortizationView: (view: "table" | "chart") => void;
  setAmortizationPage: (page: number) => void;

  hydrateFromRemote: (state: SharedState) => void;
  hydrateFromStorage: (state: SharedState) => void;

  undo: () => void;
  redo: () => void;
}

const HISTORY_LIMIT = 50;

const DEFAULT_CALCULATOR: LoanInputs = {
  principal: 1_500_000,
  annualRate: 11,
  tenureMonths: 48,
};

const DEFAULT_SHARED: SharedState = {
  mode: "single",
  calculator: DEFAULT_CALCULATOR,
  scenarios: {
    A: { principal: 1_500_000, annualRate: 11, tenureMonths: 24 },
    B: { principal: 1_500_000, annualRate: 11, tenureMonths: 48 },
    C: { principal: 1_500_000, annualRate: 11, tenureMonths: 60 },
  },
  prepayments: [],
  theme: "light",
};

export function selectShared(state: EmiStore): SharedState {
  return {
    mode: state.mode,
    calculator: state.calculator,
    scenarios: state.scenarios,
    prepayments: state.prepayments,
    theme: state.theme,
  };
}

function clampInput(field: keyof LoanInputs, value: number): number {
  const bounds = LOAN_BOUNDS[field];
  if (!Number.isFinite(value)) return bounds.min;
  return Math.min(Math.max(value, bounds.min), bounds.max);
}

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useEmiStore = create<EmiStore>()(
  syncMiddleware<EmiStore>(selectShared)(
    persistMiddleware<EmiStore>(selectShared)((set, get) => {
      const recorded = (extra: Partial<SharedState>) => {
        const state = get();
        return {
          ...extra,
          _origin: "local" as Origin,
          _past: [...state._past, selectShared(state)].slice(-HISTORY_LIMIT),
          _future: [] as SharedState[],
        };
      };

      return {
        ...DEFAULT_SHARED,
        amortizationView: "table",
        amortizationPage: 1,
        _origin: "init",
        _past: [],
        _future: [],

        setCalculatorInput: (field, value) =>
          set((s) =>
            recorded({ calculator: { ...s.calculator, [field]: clampInput(field, value) } })
          ),

        setScenarioInput: (key, field, value) =>
          set((s) =>
            recorded({
              scenarios: {
                ...s.scenarios,
                [key]: { ...s.scenarios[key], [field]: clampInput(field, value) },
              },
            })
          ),

        setMode: (mode) => set(() => recorded({ mode })),

        setTheme: (theme) => set(() => recorded({ theme })),

        toggleTheme: () =>
          set((s) => recorded({ theme: s.theme === "light" ? "dark" : "light" })),

        addPrepayment: (month, amount) =>
          set((s) =>
            recorded({ prepayments: [...s.prepayments, { id: uid(), month, amount }] })
          ),

        updatePrepayment: (id, patch) =>
          set((s) =>
            recorded({
              prepayments: s.prepayments.map((p) =>
                p.id === id ? { ...p, ...patch } : p
              ),
            })
          ),

        removePrepayment: (id) =>
          set((s) =>
            recorded({ prepayments: s.prepayments.filter((p) => p.id !== id) })
          ),

        clearPrepayments: () => set(() => recorded({ prepayments: [] })),

        setAmortizationView: (view) =>
          set({ amortizationView: view, _origin: "ui" }),

        setAmortizationPage: (page) =>
          set({ amortizationPage: Math.max(1, page), _origin: "ui" }),

        hydrateFromRemote: (state) =>
          set((s) => ({
            ...state,
            _origin: "remote",
            _past: [...s._past, selectShared(s)].slice(-HISTORY_LIMIT),
            _future: [],
          })),

        hydrateFromStorage: (state) =>
          set({ ...state, _origin: "storage" }),

        undo: () =>
          set((s) => {
            if (s._past.length === 0) return {};
            const previous = s._past[s._past.length - 1];
            return {
              ...previous,
              _origin: "local",
              _past: s._past.slice(0, -1),
              _future: [...s._future, selectShared(s)].slice(-HISTORY_LIMIT),
            };
          }),

        redo: () =>
          set((s) => {
            if (s._future.length === 0) return {};
            const next = s._future[s._future.length - 1];
            return {
              ...next,
              _origin: "local",
              _past: [...s._past, selectShared(s)].slice(-HISTORY_LIMIT),
              _future: s._future.slice(0, -1),
            };
          }),
      };
    })
  )
);
