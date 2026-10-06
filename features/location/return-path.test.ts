import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./return-path";

describe("safeReturnPath", () => {
  it("keeps same-site paths with their query", () => {
    expect(safeReturnPath("/search?q=tv&radius=10")).toBe("/search?q=tv&radius=10");
    expect(safeReturnPath("/")).toBe("/");
  });

  it("refuses anything that could leave the site", () => {
    for (const bad of ["https://evil.example", "//evil.example/x", "/\\evil.example", "javascript:alert(1)", "", null]) {
      expect(safeReturnPath(bad as string | null)).toBe("/");
    }
  });
});
