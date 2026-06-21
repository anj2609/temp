"use client";

import { useEffect, useRef } from "react";

const CHANNEL = "emi-scroll-v1";

export function useScrollSync() {
  const channel = useRef<BroadcastChannel | null>(null);
  const receiving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    channel.current = new BroadcastChannel(CHANNEL);

    channel.current.onmessage = (e: MessageEvent<{ scrollY: number }>) => {
      if (typeof e.data?.scrollY !== "number") return;
      receiving.current = true;
      window.scrollTo({ top: e.data.scrollY, behavior: "instant" });
      setTimeout(() => { receiving.current = false; }, 60);
    };

    const onScroll = () => {
      if (receiving.current) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        channel.current?.postMessage({ scrollY: window.scrollY });
      }, 80);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer.current);
      channel.current?.close();
    };
  }, []);
}
