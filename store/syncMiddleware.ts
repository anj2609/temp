import type { StateCreator } from "zustand";
import type { SharedState } from "@/types/domain";
import { broadcastState } from "@/lib/sync";

export function syncMiddleware<T extends { _origin: string }>(
  selectShared: (state: T) => SharedState
) {
  return (creator: StateCreator<T>): StateCreator<T> =>
    (set, get, api) => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      api.subscribe((state) => {
        if (state._origin !== "local") return;
        clearTimeout(timer);
        timer = setTimeout(() => broadcastState(selectShared(get())), 50);
      });

      return creator(set, get, api);
    };
}
