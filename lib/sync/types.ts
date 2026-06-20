import type { SharedState } from "@/types/domain";

export const SYNC_CHANNEL = "emi-sync-v1";

export const HEARTBEAT_INTERVAL = 2000;
export const SWEEP_INTERVAL = 3000;
export const PRESENCE_TIMEOUT = 5000;

export type SyncMessage =
  | { type: "STATE_UPDATE"; sourceTabId: string; timestamp: number; state: SharedState }
  | { type: "TAB_HELLO"; tabId: string; timestamp: number }
  | { type: "TAB_HEARTBEAT"; tabId: string; timestamp: number }
  | { type: "TAB_BYE"; tabId: string }
  | { type: "LEADER_REQUEST_STATE"; tabId: string };

export interface PresenceInfo {
  tabId: string;
  count: number;
  leaderId: string | null;
  isLeader: boolean;
}
