import { SYNC_CHANNEL, type SyncMessage } from "./types";

export type SyncListener = (message: SyncMessage) => void;

export class SyncChannel {
  private channel: BroadcastChannel | null;

  constructor() {
    this.channel =
      typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(SYNC_CHANNEL)
        : null;
  }

  get isOpen(): boolean {
    return this.channel !== null;
  }

  post(message: SyncMessage): void {
    this.channel?.postMessage(message);
  }

  subscribe(listener: SyncListener): () => void {
    const channel = this.channel;
    if (!channel) return () => {};

    const handler = (event: MessageEvent<SyncMessage>) => listener(event.data);
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }

  close(): void {
    this.channel?.close();
    this.channel = null;
  }
}
