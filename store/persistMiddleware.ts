import type { StateCreator } from "zustand";
import type { SharedState } from "@/types/domain";

export const PERSIST_KEY = "emi-workspace-v1";

export function readPersistedState(): SharedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    return raw ? (JSON.parse(raw) as SharedState) : null;
  } catch {
    return null;
  }
}

export function persistMiddleware<T extends { _origin: string }>(
  selectShared: (state: T) => SharedState
) {
  return (creator: StateCreator<T>): StateCreator<T> =>
    (set, get, api) => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      api.subscribe((state) => {
        if (state._origin !== "local" && state._origin !== "remote") return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            window.localStorage.setItem(
              PERSIST_KEY,
              JSON.stringify(selectShared(get()))
            );
          } catch {
            return;
          }
        }, 120);
      });

      return creator(set, get, api);
    };
}
