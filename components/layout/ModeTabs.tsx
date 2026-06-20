"use client";

import { Toggle } from "@/components/ui/Toggle";
import { useEmiStore } from "@/store/useEmiStore";
import type { Mode } from "@/types/domain";

export function ModeTabs() {
  const mode = useEmiStore((s) => s.mode);
  const setMode = useEmiStore((s) => s.setMode);

  return (
    <Toggle<Mode>
      value={mode}
      onChange={setMode}
      options={[
        { value: "single", label: "Single" },
        { value: "compare", label: "Compare" },
        { value: "prepayment", label: "Prepayment" },
      ]}
    />
  );
}
