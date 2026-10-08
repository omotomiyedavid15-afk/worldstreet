import { describe, expect, it } from "vitest";
import { ESCROW, confirmReleaseCopy, escrowLine } from "./escrow";

describe("escrow copy (L14 test 8)", () => {
  it("never makes a blanket promise", () => {
    for (const text of Object.values(ESCROW)) expect(text).not.toMatch(/every deal/i);
  });

  it("doesn't claim escrow where there's no escrow", () => {
    expect(escrowLine({ kind: "vehicle" })).toBe(ESCROW.noEscrow);
    expect(escrowLine({ kind: "property" })).toBe(ESCROW.noEscrow);
    expect(escrowLine({ kind: "goods" })).toBe(ESCROW.claim);
  });
});

describe("home hero copy", () => {
  it("states the real numbers from config", async () => {
    const { HERO_SLIDES } = await import("./trust");
    expect(HERO_SLIDES.length).toBeLessThanOrEqual(3);
    expect(HERO_SLIDES.find((s) => s.id === "inspect")!.body).toContain("72 hours");
    // The short escrow line mustn't hide that the inspection window can release the money (L11.4).
    expect(ESCROW.strip).not.toMatch(/until you confirm/i);
  });
});

describe("listing protection copy (L7, R-005)", () => {
  it("states the protection windows from config", async () => {
    const { rules } = await import("@/config/marketplace-rules");
    expect(ESCROW.afterRelease).toContain(`${rules.protection.anyIssueDays} days`);
    expect(ESCROW.afterRelease).toContain(`${rules.protection.counterfeitSafetyDays} days`);
    expect(ESCROW.offPlatform).toMatch(/isn't covered/);
  });

  it("states release consequences before confirmation (R-212, R-243)", async () => {
    const { rules } = await import("@/config/marketplace-rules");
    const copy = confirmReleaseCopy("₦452,000");
    expect(copy).toContain("Release ₦452,000");
    expect(copy).toContain(`${rules.protection.anyIssueDays} days`);
    expect(copy).toMatch(/refund from the seller/i);
  });
});
