import { describe, expect, it } from "vitest";
import { findArea } from "@/lib/areas";
import { repos } from "@/lib/data";
import { applyFilters, facetCounts, parseFilters, passes } from "./filters";
import { filterChips } from "./filter-labels";
import { runSearch } from "./run";

const lagos = findArea("lagos")!;
const cats = ["phones", "electronics", "fashion"] as const;

describe("parseFilters", () => {
  it("reads every group and drops junk", () => {
    expect(parseFilters({ cond: "new,used,junk", fmt: "offers", del: "free,teleport", seller: "verified", within: "7" }, cats)).toEqual({
      cond: ["new", "used"],
      fmt: ["offers"],
      del: ["free"],
      seller: ["verified"],
      within: 7,
    });
    expect(parseFilters({ cond: "", within: "3", seller: "nobody" }, cats)).toEqual({});
  });
});

describe("applying filters", () => {
  it("ORs values in a group and ANDs groups", async () => {
    const all = await repos.listings.list();
    const out = applyFilters(all, { cond: ["new", "like_new"], fmt: ["offers"] });
    expect(out.length).toBeGreaterThan(0);
    for (const l of out) {
      expect(["new", "like_new"]).toContain(l.condition);
      expect(l.offers_enabled).toBe(true);
    }
  });

  it("judges delivery from the buyer's city", async () => {
    const all = await repos.listings.list();
    // A 1–2 day rider reaches buyers in the seller's city only; elsewhere only the slower courier does.
    const local = all.find((l) => l.delivery.some((d) => d.method === "rider" && d.eta_days[1] <= 2) && l.delivery.some((d) => d.method === "courier"))!;
    expect(passes(local, { del: ["fast"] }, { city: local.location.city })).toBe(true);
    expect(passes(local, { del: ["fast"] }, { city: "Kano" })).toBe(false);
  });

  it("keeps only recent listings for 'Listed within'", async () => {
    const all = await repos.listings.list();
    const now = Date.now();
    for (const l of applyFilters(all, { within: 7 }, { now })) expect(now - Date.parse(l.created_at)).toBeLessThanOrEqual(7 * 86_400_000);
  });
});

describe("facet counts (R-016)", () => {
  it("each count is what ticking that option alone in its group would show", async () => {
    const listings = await repos.listings.list();
    const filters = { cond: ["new" as const] };
    const r = runSearch({ listings, query: { kind: "browse", raw: "" }, filters, anchor: lagos, radius: 25, sort: "best", page: 1, city: "Lagos" });
    for (const [value, n] of r.facets.get("seller")!) {
      const withIt = runSearch({ listings, query: { kind: "browse", raw: "" }, filters: { ...filters, seller: [value as "verified"] }, anchor: lagos, radius: 25, sort: "best", page: 1, city: "Lagos" });
      expect(withIt.total, value).toBe(n);
    }
    // The condition group's own counts ignore its current choice, so other conditions show what they'd add.
    expect(r.facets.get("cond")!.get("used")).toBeGreaterThan(0);
  });

  it("counts categories inside the radius", async () => {
    const listings = await repos.listings.list();
    const counts = facetCounts(listings, {}, {});
    expect([...counts.get("cat")!.values()].reduce((a, b) => a + b, 0)).toBe(listings.length);
  });
});

describe("chips", () => {
  it("gives one chip per value, each removing only itself", () => {
    const chips = filterChips({ cond: ["new", "used"], within: 7 }, []);
    expect(chips.map((c) => c.label)).toEqual(["Brand new", "Pre-owned", "Listed in the last 7 days"]);
    expect(chips[0].remove).toEqual({ cond: "used" });
    expect(chips[1].remove).toEqual({ cond: "new" });
  });
});

describe("form submissions", () => {
  it("reads repeated params from the filter form as well as comma lists", () => {
    expect(parseFilters({ cond: ["new", "used"], del: "free,pickup" }, cats)).toEqual({ cond: ["new", "used"], del: ["free", "pickup"] });
  });
});
