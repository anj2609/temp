"use client";

import { useEffect, useRef, useState } from "react";
import { useToastStore, type Toast } from "@/hooks/useToastStore";
import { tabColor } from "@/lib/sync/tabIdentity";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

function TabIdenticon({ id }: { id: string }) {
  const h = id.split("").reduce((acc, c) => (Math.imul(acc, 31) + c.charCodeAt(0)) >>> 0, 0);
  const b = (n: number) => Boolean((h >> n) & 1);
  const grid = [
    [b(0), b(3), b(0)],
    [b(1), b(4), b(1)],
    [b(2), b(3), b(2)],
  ];
  return (
    <svg viewBox="0 0 15 15" width="14" height="14" aria-hidden>
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect key={`${r}-${c}`} x={c * 5} y={r * 5} width="4" height="4" rx="0.8" fill="currentColor" />
          ) : null
        )
      )}
    </svg>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(onDismiss, 300);
    }, 3000);
    return () => {
      cancelAnimationFrame(show);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  const color = toast.tabId ? tabColor(toast.tabId) : "var(--accent)";

  return (
    <div
      role="status"
      className="pointer-events-auto flex max-w-[280px] overflow-hidden border border-border bg-surface shadow-float transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
      }}
    >
      <span className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex items-start gap-2 px-3 py-2.5">
        {toast.tabId && (
          <span className="mt-0.5 flex-shrink-0" style={{ color }}>
            <TabIdenticon id={toast.tabId} />
          </span>
        )}
        <span className="text-sm leading-snug text-ink">{toast.message}</span>
      </div>
    </div>
  );
}
