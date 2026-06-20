import type { SensitivityCell, SensitivityGrid } from "@/types/domain";
import { LOAN_BOUNDS } from "@/types/domain";
import { calculateEmi } from "./emi";

const RATE_OFFSETS = [-3, -2, -1, 0, 1, 2, 3];
const TENURE_OFFSETS = [-24, -12, -6, 0, 6, 12, 24];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildAxis(
  current: number,
  offsets: number[],
  min: number,
  max: number,
  round: boolean
): number[] {
  const seen = new Set<number>();
  const axis: number[] = [];

  for (const offset of offsets) {
    let value = clamp(current + offset, min, max);
    if (round) value = Math.round(value);
    else value = Math.round(value * 100) / 100;
    if (!seen.has(value)) {
      seen.add(value);
      axis.push(value);
    }
  }

  return axis;
}

export function buildSensitivityGrid(
  principal: number,
  currentRate: number,
  currentTenure: number
): SensitivityGrid {
  const rates = buildAxis(
    currentRate,
    RATE_OFFSETS,
    LOAN_BOUNDS.annualRate.min,
    LOAN_BOUNDS.annualRate.max,
    false
  );
  const tenures = buildAxis(
    currentTenure,
    TENURE_OFFSETS,
    LOAN_BOUNDS.tenureMonths.min,
    LOAN_BOUNDS.tenureMonths.max,
    true
  );

  const cells: SensitivityCell[][] = tenures.map((tenure) =>
    rates.map<SensitivityCell>((rate) => ({
      rate,
      tenure,
      emi: calculateEmi(principal, rate, tenure),
      isCurrent:
        Math.abs(rate - currentRate) < 0.001 && tenure === Math.round(currentTenure),
    }))
  );

  return { rates, tenures, cells };
}
