import { describe, expect, it } from "vitest";
import { priceSeries } from "@/features/listing-detail/PriceHistory";
import { checkItems, checkSearches, emptyAlerts, parseAlerts, setItemAlert, setSearchAlert } from "./model";

const AT = "2026-10-08T09:00:00.000Z";
const phone = { id: "204501", title: "iPhone 14 Pro", href: "/listing/204501-iphone", price_minor: 845_000_00, status: "live" as const };

describe("B4 alerts", () => {
  it("fires a price drop once, then again only on a further drop", () => {
    let s = setItemAlert(emptyAlerts, { ...phone, price_minor: 900_000_00 }, "price_drop", true);
    const first = checkItems(s, [phone], AT);
    expect(first.notices).toEqual([expect.objectContaining({ id: "alert:price:204501:84500000", title: "Price dropped: iPhone 14 Pro", body: "Now ₦845,000, ₦55,000 less than before.", href: phone.href })]);
    s = first.state;
    expect(checkItems(s, [phone], AT)).toEqual({ state: s, notices: [] });
    expect(checkItems(s, [{ ...phone, price_minor: 860_000_00 }], AT).notices).toEqual([]);
  });
  it("tells a watcher when a paused item is back, and only when they opted in", () => {
    const paused = { ...phone, status: "paused" as const };
    const s = setItemAlert(emptyAlerts, paused, "back_in_stock", true);
    expect(checkItems(s, [phone], AT).notices[0].title).toBe("Back in stock: iPhone 14 Pro");
    expect(checkItems(setItemAlert(s, paused, "back_in_stock", false), [phone], AT).notices).toEqual([]);
    expect(setItemAlert(s, paused, "back_in_stock", false).items).toEqual([]);
  });
  it("counts new matches for a saved search and ignores shrinking results", () => {
    let s = setSearchAlert(emptyAlerts, "/search?q=iphone", "iphone", true, 3);
    const r = checkSearches(s, { "/search?q=iphone": 5 }, AT);
    expect(r.notices.map((n) => n.title)).toEqual(["2 new listings for “iphone”"]);
    s = r.state;
    expect(checkSearches(s, { "/search?q=iphone": 4 }, AT).notices).toEqual([]);
    expect(checkSearches(s, {}, AT).state).toBe(s);
  });
  it("rejects malformed saved alerts", () => {
    expect(() => parseAlerts({ items: [{ id: "1", price_drop: "yes" }], searches: [] })).toThrow();
    expect(() => parseAlerts({ items: [], searches: [{ href: "https://evil.example", label: "x", last_total: 1 }] })).toThrow();
    expect(parseAlerts({ items: [], searches: [] })).toEqual(emptyAlerts);
  });
});

describe("PriceHistorySparkline series", () => {
  const now = Date.parse("2026-10-08T09:00:00Z");
  const created = "2026-09-20T09:00:00Z";
  it("steps from the window start through each change to now", () => {
    const series = priceSeries(845_000_00, created, [{ at: "2026-10-01T09:00:00Z", change: "price", from_minor: 920_000_00 as never, to_minor: 845_000_00 as never }, { at: "2026-10-02T09:00:00Z", change: "description" }], now);
    expect(series).toEqual([[Date.parse(created), 920_000_00], [Date.parse("2026-10-01T09:00:00Z"), 845_000_00], [now, 845_000_00]]);
  });
  it("shows nothing without a price change in the last 30 days", () => {
    expect(priceSeries(1, created, undefined, now)).toBeNull();
    expect(priceSeries(1, "2026-07-01T00:00:00Z", [{ at: "2026-07-02T00:00:00Z", change: "price", from_minor: 2 as never, to_minor: 1 as never }], now)).toBeNull();
  });
});
