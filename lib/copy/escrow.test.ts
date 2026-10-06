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
