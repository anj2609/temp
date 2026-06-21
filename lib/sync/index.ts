import type { SharedState } from "@/types/domain";
import { SyncChannel } from "./channel";
import { PresenceTracker, createTabId } from "./tabIdentity";
import { computeLeader } from "./leaderElection";
import {
  HEARTBEAT_INTERVAL,
  PRESENCE_TIMEOUT,
  SWEEP_INTERVAL,
  type FieldActivity,
  type PresenceInfo,
  type SyncMessage,
} from "./types";

export interface SyncHandlers {
  onRemoteState: (state: SharedState, sourceTabId: string) => void;
  onPresence: (info: PresenceInfo) => void;
  onActivity: (activity: FieldActivity) => void;
  getState: () => SharedState;
}

interface Runtime {
  tabId: string;
  channel: SyncChannel;
  presence: PresenceTracker;
  handlers: SyncHandlers;
  heartbeat: ReturnType<typeof setInterval> | null;
  sweep: ReturnType<typeof setInterval> | null;
  unsubscribe: () => void;
  lastPresenceKey: string;
}

let runtime: Runtime | null = null;

function now(): number {
  return Date.now();
}

function emitPresence(rt: Runtime): void {
  const ids = rt.presence.ids(rt.tabId).sort();
  const leaderId = computeLeader(ids);
  const info: PresenceInfo = {
    tabId: rt.tabId,
    count: ids.length,
    leaderId,
    isLeader: leaderId === rt.tabId,
    peers: ids,
  };
  const key = `${leaderId}|${ids.join(",")}`;
  if (key !== rt.lastPresenceKey) {
    rt.lastPresenceKey = key;
    rt.handlers.onPresence(info);
  }
}

function amLeader(rt: Runtime): boolean {
  return computeLeader(rt.presence.ids(rt.tabId)) === rt.tabId;
}

function pushState(rt: Runtime): void {
  rt.channel.post({
    type: "STATE_UPDATE",
    sourceTabId: rt.tabId,
    timestamp: now(),
    state: rt.handlers.getState(),
  });
}

function handleMessage(rt: Runtime, message: SyncMessage): void {
  switch (message.type) {
    case "STATE_UPDATE":
      if (message.sourceTabId !== rt.tabId) {
        rt.handlers.onRemoteState(message.state, message.sourceTabId);
      }
      return;

    case "TAB_HELLO":
      if (message.tabId === rt.tabId) return;
      rt.presence.touch(message.tabId);
      rt.channel.post({ type: "TAB_HEARTBEAT", tabId: rt.tabId, timestamp: now() });
      if (amLeader(rt)) pushState(rt);
      emitPresence(rt);
      return;

    case "TAB_HEARTBEAT":
      if (message.tabId === rt.tabId) return;
      rt.presence.touch(message.tabId);
      emitPresence(rt);
      return;

    case "TAB_BYE":
      rt.presence.remove(message.tabId);
      emitPresence(rt);
      return;

    case "LEADER_REQUEST_STATE":
      if (message.tabId !== rt.tabId && amLeader(rt)) pushState(rt);
      return;

    case "FIELD_ACTIVITY":
      if (message.tabId !== rt.tabId) {
        rt.handlers.onActivity({
          tabId: message.tabId,
          field: message.field,
          value: message.value,
        });
      }
      return;
  }
}

export function initSync(handlers: SyncHandlers): () => void {
  teardownSync();

  const tabId = createTabId();
  const channel = new SyncChannel();
  const presence = new PresenceTracker();

  const rt: Runtime = {
    tabId,
    channel,
    presence,
    handlers,
    heartbeat: null,
    sweep: null,
    unsubscribe: () => {},
    lastPresenceKey: "",
  };
  runtime = rt;

  rt.unsubscribe = channel.subscribe((message) => handleMessage(rt, message));

  channel.post({ type: "TAB_HELLO", tabId, timestamp: now() });
  emitPresence(rt);

  rt.heartbeat = setInterval(() => {
    channel.post({ type: "TAB_HEARTBEAT", tabId, timestamp: now() });
  }, HEARTBEAT_INTERVAL);

  rt.sweep = setInterval(() => {
    if (presence.sweep(PRESENCE_TIMEOUT)) emitPresence(rt);
  }, SWEEP_INTERVAL);

  const farewell = () => channel.post({ type: "TAB_BYE", tabId });
  window.addEventListener("pagehide", farewell);
  window.addEventListener("beforeunload", farewell);

  const detachUnload = () => {
    window.removeEventListener("pagehide", farewell);
    window.removeEventListener("beforeunload", farewell);
  };

  const baseTeardown = rt.unsubscribe;
  rt.unsubscribe = () => {
    detachUnload();
    baseTeardown();
  };

  window.setTimeout(() => {
    if (runtime === rt && presence.hasPeers() && !amLeader(rt)) {
      channel.post({ type: "LEADER_REQUEST_STATE", tabId });
    }
  }, 250);

  return teardownSync;
}

export function broadcastState(state: SharedState): void {
  if (!runtime) return;
  runtime.channel.post({
    type: "STATE_UPDATE",
    sourceTabId: runtime.tabId,
    timestamp: now(),
    state,
  });
}

export function broadcastActivity(field: string, value: number | null): void {
  if (!runtime) return;
  runtime.channel.post({
    type: "FIELD_ACTIVITY",
    tabId: runtime.tabId,
    field,
    value,
  });
}

export function getTabId(): string {
  return runtime?.tabId ?? "";
}

export function teardownSync(): void {
  if (!runtime) return;
  const rt = runtime;
  runtime = null;

  if (rt.heartbeat) clearInterval(rt.heartbeat);
  if (rt.sweep) clearInterval(rt.sweep);
  rt.unsubscribe();
  rt.channel.post({ type: "TAB_BYE", tabId: rt.tabId });
  rt.channel.close();
}

export type { PresenceInfo, FieldActivity } from "./types";
