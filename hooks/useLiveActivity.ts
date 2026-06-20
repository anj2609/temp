import { create } from "zustand";
import type { FieldActivity } from "@/lib/sync";

const ACTIVITY_TTL = 1500;

export interface ActivityEntry {
  tabId: string;
  value: number;
  at: number;
}

interface LiveActivityStore {
  byField: Record<string, ActivityEntry>;
  apply: (activity: FieldActivity) => void;
  prune: () => void;
}

export const useLiveActivityStore = create<LiveActivityStore>((set, get) => ({
  byField: {},

  apply: (activity) => {
    const current = get().byField;
    if (activity.value === null) {
      const existing = current[activity.field];
      if (!existing || existing.tabId !== activity.tabId) return;
      const next = { ...current };
      delete next[activity.field];
      set({ byField: next });
      return;
    }
    set({
      byField: {
        ...current,
        [activity.field]: {
          tabId: activity.tabId,
          value: activity.value,
          at: Date.now(),
        },
      },
    });
  },

  prune: () => {
    const current = get().byField;
    const cutoff = Date.now() - ACTIVITY_TTL;
    let changed = false;
    const next: Record<string, ActivityEntry> = {};
    for (const [field, entry] of Object.entries(current)) {
      if (entry.at >= cutoff) next[field] = entry;
      else changed = true;
    }
    if (changed) set({ byField: next });
  },
}));

export function useFieldGhost(field: string | undefined): ActivityEntry | null {
  return useLiveActivityStore((s) => (field ? s.byField[field] ?? null : null));
}
