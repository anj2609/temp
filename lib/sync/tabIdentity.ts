export function createTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shortTabLabel(tabId: string): string {
  const compact = tabId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `Tab #${compact}`;
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
