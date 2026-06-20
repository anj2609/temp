export function computeLeader(ids: string[]): string | null {
  if (ids.length === 0) return null;
  return [...ids].sort()[0];
}

export function isLeader(tabId: string, ids: string[]): boolean {
  return computeLeader(ids) === tabId;
}
