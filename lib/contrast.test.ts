import { describe, expect, it } from "vitest";
import { composite, contrastRatio, parseRgb } from "./contrast";

describe("contrast", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio(parseRgb("rgb(0, 0, 0)"), parseRgb("rgb(255, 255, 255)"))).toBeCloseTo(21, 1);
    // DS light muted text on white: measured 4.8:1 in PLAN §1.2.
    expect(contrastRatio(parseRgb("rgb(120, 113, 108)"), parseRgb("rgb(255, 255, 255)"))).toBeCloseTo(4.8, 1);
  });

  it("composites translucent text before measuring", () => {
    const halfInk = parseRgb("rgba(10, 10, 10, 0.5)");
    expect(composite(halfInk, parseRgb("rgb(255, 255, 255)")).r).toBeCloseTo(132.5, 1);
    // --cx-text-3 in light theme: under AA, which is why the marketplace bans it for text.
    expect(contrastRatio(halfInk, parseRgb("rgb(255, 255, 255)"))).toBeLessThan(4.5);
  });

  it("rejects non-rgb input", () => {
    expect(() => parseRgb("#fff")).toThrow();
  });
});
