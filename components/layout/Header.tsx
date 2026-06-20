"use client";

import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/calculator/ThemeToggle";
import { ShareQr } from "@/components/share/ShareQr";
import { useTabPresence } from "@/hooks/useTabPresence";
import { useEmiStore } from "@/store/useEmiStore";
import { shortTabId, tabColor } from "@/lib/sync/tabIdentity";
import { cn } from "@/lib/cn";

function AvatarRail({
  peers,
  tabId,
  leaderId,
}: {
  peers: string[];
  tabId: string;
  leaderId: string | null;
}) {
  if (peers.length === 0) return null;
  const shown = peers.slice(0, 6);

  return (
    <div className="flex items-center">
      {shown.map((id, index) => {
        const isSelf = id === tabId;
        const isLead = id === leaderId;
        return (
          <span
            key={id}
            title={`Tab #${shortTabId(id)}${isSelf ? " (you)" : ""}${
              isLead ? " · leader" : ""
            }`}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-semibold text-white",
              isSelf ? "border-ink" : "border-surface"
            )}
            style={{
              backgroundColor: tabColor(id),
              marginLeft: index === 0 ? 0 : -8,
              zIndex: shown.length - index,
            }}
          >
            {shortTabId(id).slice(0, 2)}
            {isLead ? (
              <span className="absolute -right-1 -top-1.5 text-[11px]" aria-hidden>
                👑
              </span>
            ) : null}
          </span>
        );
      })}
      {peers.length > shown.length ? (
        <span className="ml-1.5 text-xs text-ink-muted">
          +{peers.length - shown.length}
        </span>
      ) : null}
    </div>
  );
}

function HistoryButton({
  label,
  glyph,
  disabled,
  onClick,
}: {
  label: string;
  glyph: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition-colors",
        disabled ? "cursor-not-allowed opacity-40" : "hover:text-ink"
      )}
    >
      {glyph}
    </button>
  );
}

export function Header() {
  const { tabId, count, leaderId, peers } = useTabPresence();
  const undo = useEmiStore((s) => s.undo);
  const redo = useEmiStore((s) => s.redo);
  const canUndo = useEmiStore((s) => s._past.length > 0);
  const canRedo = useEmiStore((s) => s._future.length > 0);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white">
          ₹
        </span>
        <div>
          <h1 className="text-lg font-semibold text-ink">EMI Workspace</h1>
          <p className="text-sm text-ink-muted">
            Shared loan calculator — synced across every open tab
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AvatarRail peers={peers} tabId={tabId} leaderId={leaderId} />
        <Badge tone="positive">
          <span className="h-2 w-2 animate-pulse rounded-full bg-positive" />
          {count} {count === 1 ? "tab" : "tabs"} active
        </Badge>

        <div className="mx-1 flex items-center gap-2">
          <HistoryButton label="Undo (Ctrl+Z)" glyph="↶" disabled={!canUndo} onClick={undo} />
          <HistoryButton label="Redo (Ctrl+Shift+Z)" glyph="↷" disabled={!canRedo} onClick={redo} />
        </div>

        <ShareQr />
        <ThemeToggle />
      </div>
    </header>
  );
}
