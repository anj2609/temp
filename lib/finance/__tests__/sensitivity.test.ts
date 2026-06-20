import { describe, expect, it } from "vitest";
import { buildSensitivityGrid } from "../sensitivity";

describe("buildSensitivityGrid", () => {
  it("matches the spec's 48-month sensitivity row", () => {
    const grid = buildSensitivityGrid(1_500_000, 12, 48);
    const tenureRow = grid.cells.find((row) => row[0].tenure === 48)!;
    const byRate = new Map(tenureRow.map((cell) => [cell.rate, Math.round(cell.emi)]));

    expect(byRate.get(9)).toBe(37_328);
    expect(byRate.get(10)).toBe(38_044);
    expect(byRate.get(11)).toBe(38_768);
    expect(byRate.get(12)).toBe(39_501);
    expect(byRate.get(13)).toBe(40_241);
  });

  it("marks exactly one current cell at the center", () => {
    const grid = buildSensitivityGrid(1_500_000, 11, 48);
    const flagged = grid.cells.flat().filter((cell) => cell.isCurrent);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].rate).toBe(11);
    expect(flagged[0].tenure).toBe(48);
  });

  it("de-duplicates clamped axes near the lower tenure boundary", () => {
    const grid = buildSensitivityGrid(1_500_000, 11, 3);
    const unique = new Set(grid.tenures);
    expect(unique.size).toBe(grid.tenures.length);
    expect(grid.tenures).toContain(1);
  });

  it("clamps rate axis within valid bounds", () => {
    const grid = buildSensitivityGrid(1_500_000, 2, 48);
    expect(Math.min(...grid.rates)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...grid.rates)).toBeLessThanOrEqual(36);
  });
});
