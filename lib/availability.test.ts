import { describe, expect, it } from "vitest";
import { availability, isUnavailable } from "./availability";

describe("availability (R-021, R-032, R-121)", () => {
  it("maps every listing status to what the page offers", () => {
    expect(availability({ status: "live", qty: 3 })).toBe("available");
    expect(availability({ status: "live", qty: 0 })).toBe("paused"); // out of stock pauses (R-121)
    expect(availability({ status: "reserved", qty: 1 })).toBe("reserved");
    expect(availability({ status: "sold", qty: 0 })).toBe("sold");
    expect(availability({ status: "ended", qty: 1 })).toBe("ended");
    expect(availability({ status: "paused", qty: 0 })).toBe("paused");
    for (const status of ["draft", "in_review", "rejected", "removed"] as const) expect(availability({ status, qty: 1 })).toBe("gone");
  });

  it("keeps the page but blocks buying only for sold, ended and paused", () => {
    expect(["available", "reserved", "sold", "ended", "paused", "gone"].filter((a) => isUnavailable(a as never))).toEqual(["sold", "ended", "paused"]);
  });
});
