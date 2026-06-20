"use client";

import { useEmiStore } from "@/store/useEmiStore";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export function ThemeToggle() {
  const theme = useEmiStore((s) => s.theme);
  const toggleTheme = useEmiStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme (synced across tabs)"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition-colors hover:text-ink"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
