"use client";

import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const go = (next: number) => onChange(Math.min(Math.max(next, 1), pageCount));

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(
          "border border-border px-3 py-1.5 font-medium text-ink-muted transition-colors",
          page <= 1 ? "cursor-not-allowed opacity-40" : "hover:text-ink"
        )}
      >
        Previous
      </button>
      <span className="text-ink-subtle">
        Page <span className="font-medium text-ink">{page}</span> of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        className={cn(
          "border border-border px-3 py-1.5 font-medium text-ink-muted transition-colors",
          page >= pageCount ? "cursor-not-allowed opacity-40" : "hover:text-ink"
        )}
      >
        Next
      </button>
    </div>
  );
}
