"use client";

import { useEmiStore } from "@/store/useEmiStore";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export function ThemeToggle() {
  const theme = useEmiStore((s) => s.theme);
  const toggleTheme = useEmiStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    document.documentElement.style.setProperty("--ripple-x", `${x}px`);
    document.documentElement.style.setProperty("--ripple-y", `${y}px`);

    if (!("startViewTransition" in document)) {
      toggleTheme();
      return;
    }
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
      () => toggleTheme()
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title="Toggle theme (synced across tabs)"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition-colors hover:text-ink"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
