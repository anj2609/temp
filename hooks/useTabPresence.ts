import { create } from "zustand";
import type { PresenceInfo } from "@/lib/sync";

interface PresenceStore extends PresenceInfo {
  setPresence: (info: PresenceInfo) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  tabId: "",
  count: 1,
  leaderId: null,
  isLeader: false,
  setPresence: (info) => set(info),
}));

export function useTabPresence(): PresenceInfo {
  const tabId = usePresenceStore((s) => s.tabId);
  const count = usePresenceStore((s) => s.count);
  const leaderId = usePresenceStore((s) => s.leaderId);
  const isLeader = usePresenceStore((s) => s.isLeader);
  return { tabId, count, leaderId, isLeader };
}
