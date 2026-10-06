import { describe, expect, it } from "vitest";
import { ESCROW, escrowLine } from "./escrow";

describe("escrow copy (L14 test 8)", () => {
  it("never makes a blanket promise", () => {
    for (const text of Object.values(ESCROW)) expect(text).not.toMatch(/every deal/i);
  });

  it("doesn't claim escrow where there's no escrow checkout", () => {
    expect(escrowLine({ kind: "vehicle" })).toBe(ESCROW.noEscrow);
    expect(escrowLine({ kind: "property" })).toBe(ESCROW.noEscrow);
    expect(escrowLine({ kind: "goods" })).toBe(ESCROW.claim);
  });
});

describe("home trust copy", () => {
  it("states the real numbers from config", async () => {
    const { TRUST, HERO_SLIDES } = await import("./trust");
    expect(TRUST.map((t) => t.body).join(" ")).toContain("₦20,000");
    expect(HERO_SLIDES.length).toBeLessThanOrEqual(3);
    expect(HERO_SLIDES.find((s) => s.id === "inspect")!.body).toContain("72 hours");
    // The short escrow line mustn't hide that the inspection window can release the money (L11.4).
    expect(ESCROW.strip).not.toMatch(/until you confirm/i);
  });
});
