"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrIcon } from "@/components/ui/icons";

export function ShareQr() {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const current = window.location.href;
    setUrl(current);
    QRCode.toDataURL(current, {
      width: 220,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      return;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Share this scenario"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Share / open on your phone"
        className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <QrIcon size={16} />
        Share
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Share this scenario"
          className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border bg-surface p-4 shadow-float"
        >
          <p className="text-sm font-semibold text-ink">Scan to continue on your phone</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            This scenario is encoded in the link below.
          </p>
          <div className="mt-3 flex justify-center rounded-xl bg-white p-3">
            {dataUrl ? (
              <img src={dataUrl} alt="QR code for this scenario" width={180} height={180} />
            ) : (
              <div className="h-[180px] w-[180px] animate-pulse rounded-lg bg-surface-muted" />
            )}
          </div>
          <button
            type="button"
            onClick={copy}
            className="mt-3 w-full rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
