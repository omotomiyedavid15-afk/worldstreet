import { describe, expect, it } from "vitest";
import { can, next, type OfferStatus } from "./offer";

describe("offer state machine (§6.3)", () => {
  const arrows = [
    ["pending", "accept", "accepted"], ["pending", "counter", "countered"],
    ["pending", "decline", "declined"], ["pending", "expire", "expired"],
    ["pending", "withdraw", "withdrawn"], ["countered", "accept", "accepted"],
    ["countered", "counter", "pending"], ["countered", "decline", "declined"],
    ["countered", "expire", "expired"], ["accepted", "pay", "paid"],
    ["accepted", "lapse", "lapsed"],
  ] as const;
  it.each(arrows)("%s + %s → %s", (status, event, expected) => {
    expect(can(status, event)).toBe(true);
    expect(next(status, event)).toBe(expected);
  });
  it("rejects every other arrow, including terminal states", () => {
    const states: OfferStatus[] = ["pending", "countered", "accepted", "declined", "expired", "withdrawn", "paid", "lapsed"];
    for (const state of states) for (const event of ["accept", "counter", "decline", "expire", "withdraw", "pay", "lapse"] as const) {
      if (arrows.some(([from, action]) => from === state && action === event)) continue;
      expect(can(state, event)).toBe(false);
      expect(() => next(state, event)).toThrow();
    }
  });
});
