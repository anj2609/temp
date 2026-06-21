"use client";

import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/calculator/ThemeToggle";
import { ShareQr } from "@/components/share/ShareQr";
import { RedoIcon, UndoIcon } from "@/components/ui/icons";
import { useTabPresence } from "@/hooks/useTabPresence";
import { useEmiStore } from "@/store/useEmiStore";
import { shortTabId, tabColor } from "@/lib/sync/tabIdentity";
import { cn } from "@/lib/cn";

function tabHash(id: string): number {
  return id.split("").reduce((acc, c) => (Math.imul(acc, 31) + c.charCodeAt(0)) >>> 0, 0);
}

function TabIdenticon({ id }: { id: string }) {
  const h = tabHash(id);
  // 5 bits → symmetric 3×3 grid (left col + center col mirrored)
  const b = (n: number) => Boolean((h >> n) & 1);
  const grid = [
    [b(0), b(3), b(0)],
    [b(1), b(4), b(1)],
    [b(2), b(3), b(2)],
  ];
  return (
    <svg viewBox="0 0 15 15" width="17" height="17" aria-hidden>
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
            title={`Tab #${shortTabId(id)}${isSelf ? " (you)" : ""}${isLead ? ", leader" : ""}`}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-full ring-2",
              isSelf || isLead ? "ring-accent" : "ring-border"
            )}
            style={{
              backgroundColor: "var(--surface)",
              color: tabColor(id),
              marginLeft: index === 0 ? 0 : -10,
              zIndex: shown.length - index,
            }}
          >
            <TabIdenticon id={id} />
          </span>
        );
      })}
    </div>
  );
}

function HistoryButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
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
      {icon}
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
    <header className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3">
        <AvatarRail peers={peers} tabId={tabId} leaderId={leaderId} />
        <Badge tone="neutral">
          {count} {count === 1 ? "session" : "sessions"} live
        </Badge>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <HistoryButton
          label="Undo (Ctrl+Z)"
          icon={<UndoIcon />}
          disabled={!canUndo}
          onClick={undo}
        />
        <HistoryButton
          label="Redo (Ctrl+Shift+Z)"
          icon={<RedoIcon />}
          disabled={!canRedo}
          onClick={redo}
        />
        <ShareQr />
        <ThemeToggle />
      </div>
    </header>
  );
}
