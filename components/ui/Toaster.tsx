"use client";

import { useEffect, useRef, useState } from "react";
import { useToastStore, type Toast } from "@/hooks/useToastStore";
import { tabColor, shortTabLabel } from "@/lib/sync/tabIdentity";

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

  const dot = toast.tabId ? tabColor(toast.tabId) : null;
  const label = toast.tabId ? shortTabLabel(toast.tabId) : null;

  return (
    <div
      role="status"
      className="pointer-events-auto flex max-w-[280px] items-start gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-float text-sm text-ink transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {dot && (
        <span
          className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      <span className="leading-snug">
        {label && <span className="font-medium">{label} </span>}
        {toast.message}
      </span>
    </div>
  );
}
