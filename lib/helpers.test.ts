import { describe, expect, it } from "vitest";
import type { DeliveryOption } from "@/lib/data/types";
import { deliveryFee, summariseDelivery } from "./delivery";
import { formatCount, formatDistance, plural, timeAgo, timeLeft } from "./format";
import { kobo, toMinor } from "./money";
import { buyerTotal } from "./pricing";

describe("format", () => {
  it("groups counts and pluralises", () => {
    expect(formatCount(1284)).toBe("1,284");
    expect(plural(1, "watcher")).toBe("1 watcher");
    expect(plural(22, "watcher")).toBe("22 watchers");
    expect(plural(0, "rating")).toBe("0 ratings");
    expect(plural(64, "sold", "sold")).toBe("64 sold");
    expect(plural(2, "person", "people")).toBe("2 people");
  });

  it("formats distances at a sensible precision", () => {
    expect(formatDistance(0.4)).toBe("Under 1 km");
    expect(formatDistance(4.24)).toBe("4.2 km");
    expect(formatDistance(9.96)).toBe("10 km");
    expect(formatDistance(12.6)).toBe("13 km");
    expect(formatDistance(1528)).toBe("1,528 km");
  });

  it("says how long ago, short and long", () => {
    const now = Date.parse("2026-10-06T09:00:00Z");
    const at = (ms: number) => new Date(now - ms).toISOString();
    expect(timeAgo(at(5 * 60_000), now)).toEqual({ short: "Just now", long: "just now" });
    expect(timeAgo(at(3_600_000), now)).toEqual({ short: "1h ago", long: "1 hour ago" });
    expect(timeAgo(at(3 * 86_400_000), now)).toEqual({ short: "3d ago", long: "3 days ago" });
    expect(timeAgo(at(15 * 86_400_000), now)).toEqual({ short: "2w ago", long: "2 weeks ago" });
    expect(timeAgo(at(65 * 86_400_000), now)).toEqual({ short: "2mo ago", long: "2 months ago" });
    expect(timeAgo(at(-10 * 60_000), now).short).toBe("Just now"); // clock skew
  });

  it("says how long is left, then null", () => {
    const now = Date.parse("2026-10-06T09:00:00Z");
    const at = (ms: number) => new Date(now + ms).toISOString();
    expect(timeLeft(at((2 * 24 + 4) * 3_600_000 + 59_000), now)).toBe("2d 4h");
    expect(timeLeft(at(3 * 3_600_000 + 12 * 60_000), now)).toBe("3h 12m");
    expect(timeLeft(at(20_000), now)).toBe("1m");
    expect(timeLeft(at(0), now)).toBeNull();
  });
});

describe("buyerTotal (R-003)", () => {
  it("is item + delivery + fees − discounts", () => {
    expect(buyerTotal({ item_minor: toMinor(100_000), delivery_minor: toMinor(3_000) })).toBe(toMinor(103_000));
    expect(
      buyerTotal({ item_minor: toMinor(20_000), qty: 3, delivery_minor: toMinor(2_500), fees_minor: toMinor(500), discount_minor: toMinor(5_000) }),
    ).toBe(toMinor(58_000));
  });

  it("never goes below zero and rejects bad quantities", () => {
    expect(buyerTotal({ item_minor: toMinor(1_000), delivery_minor: kobo(0), discount_minor: toMinor(5_000) })).toBe(0);
    expect(() => buyerTotal({ item_minor: toMinor(1_000), qty: 0, delivery_minor: kobo(0) })).toThrow(RangeError);
    expect(() => buyerTotal({ item_minor: toMinor(1_000), qty: 1.5, delivery_minor: kobo(0) })).toThrow(RangeError);
  });
});

describe("summariseDelivery", () => {
  const opt = (method: DeliveryOption["method"], naira: number, coverage: DeliveryOption["coverage"]): DeliveryOption => ({
    method,
    fee_minor: toMinor(naira),
    eta_days: [1, 2],
    coverage,
  });
  const lagos = [opt("rider", 2_500, "same_city"), opt("meet_up", 0, "same_city"), opt("courier", 4_500, "nationwide")];

  it("picks the cheapest delivery the buyer can get", () => {
    expect(summariseDelivery(lagos, true)).toMatchObject({ kind: "paid", fee_minor: toMinor(2_500) });
    expect(summariseDelivery(lagos, false)).toMatchObject({ kind: "paid", fee_minor: toMinor(4_500) });
    expect(summariseDelivery(lagos)).toMatchObject({ kind: "paid", fee_minor: toMinor(2_500) }); // no anchor yet
  });

  it("never calls a meet-up free delivery", () => {
    const s = summariseDelivery([opt("meet_up", 0, "same_city")], true);
    expect(s.kind).toBe("pickup");
    expect(deliveryFee(s)).toBeNull();
  });

  it("reports free delivery and its zero fee", () => {
    const s = summariseDelivery([opt("courier", 0, "nationwide")], false);
    expect(s.kind).toBe("free");
    expect(deliveryFee(s)).toBe(0);
  });

  it("says when nothing reaches the buyer", () => {
    expect(summariseDelivery([opt("rider", 15_000, "same_city")], false).kind).toBe("none");
    expect(summariseDelivery([], true).kind).toBe("none");
  });
});
