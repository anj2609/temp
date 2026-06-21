export function createTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shortTabId(tabId: string): string {
  return tabId.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export function shortTabLabel(tabId: string): string {
  return `Tab #${shortTabId(tabId)}`;
}

const TAB_PALETTE = [
  "#5f86bd",
  "#c06b70",
  "#4f9b78",
  "#8b6fc0",
  "#4f9aa0",
  "#c08a4a",
  "#b56992",
];

export function tabColor(tabId: string): string {
  let hash = 0;
  for (let i = 0; i < tabId.length; i++) {
    hash = (hash * 31 + tabId.charCodeAt(i)) >>> 0;
  }
  return TAB_PALETTE[hash % TAB_PALETTE.length];
}

export class PresenceTracker {
  private lastSeen = new Map<string, number>();

  touch(tabId: string, at: number = Date.now()): void {
    this.lastSeen.set(tabId, at);
  }

  remove(tabId: string): void {
    this.lastSeen.delete(tabId);
  }

  has(tabId: string): boolean {
    return this.lastSeen.has(tabId);
  }

  sweep(timeout: number, now: number = Date.now()): boolean {
    let changed = false;
    for (const [tabId, seenAt] of this.lastSeen) {
      if (now - seenAt > timeout) {
        this.lastSeen.delete(tabId);
        changed = true;
      }
    }
    return changed;
  }

  ids(selfId: string): string[] {
    return Array.from(new Set([selfId, ...this.lastSeen.keys()]));
  }

  count(selfId: string): number {
    return this.ids(selfId).length;
  }

  hasPeers(): boolean {
    return this.lastSeen.size > 0;
  }
}
