import { describe, expect, it } from "vitest";
import { findArea } from "@/lib/areas";
import { repos } from "@/lib/data";
import { toMinor } from "@/lib/money";
import { parseFilters } from "./filters";
import { parseQuery } from "./query";
import { parsePage, runSearch } from "./run";

const lekki = findArea("lekki")!;
const base = async () => ({ listings: await repos.listings.list(), anchor: lekki, sort: "best" as const, page: 1, filters: {} });

describe("runSearch", () => {
  it("browses everything nearby for an empty query", async () => {
    const r = runSearch({ ...(await base()), query: { kind: "browse", raw: "" }, radius: 25 });
    expect(r.total).toBe(r.radiusCounts.get(25));
    expect(r.total).toBeGreaterThan(10);
  });

  it("pages in steps of 24 and reports the true total", async () => {
    const one = runSearch({ ...(await base()), query: { kind: "browse", raw: "" }, radius: null });
    const two = runSearch({ ...(await base()), query: { kind: "browse", raw: "" }, radius: null, page: 2 });
    expect(one.shown).toHaveLength(24);
    expect(two.shown.length).toBe(Math.min(48, two.total));
    expect(two.shown.slice(0, 24)).toEqual(one.shown);
  });

  it("applies category and price, and counts what each filter costs", async () => {
    const q = parseQuery("phone");
    if (q.kind !== "text") throw new Error();
    const filters = { cat: "phones" as const, max: toMinor(200_000) };
    const r = runSearch({ ...(await base()), query: q, filters, radius: null });
    for (const l of r.shown) {
      expect(l.category_id).toBe("phones");
      expect(l.price_minor).toBeLessThanOrEqual(toMinor(200_000));
    }
    expect(r.filterCounts.get("price")!).toBeGreaterThanOrEqual(r.total);
    expect(r.filterCounts.get("cat")!).toBeGreaterThanOrEqual(r.total);
  });
});

describe("hidden listings", () => {
  it("leaves hidden listings and sellers out of results and counts", async () => {
    const b = await base();
    const all = runSearch({ ...b, query: { kind: "browse", raw: "" }, radius: null });
    const hidden = { listings: new Set(["204507"]), sellers: new Set(["s03"]) };
    const r = runSearch({ ...b, query: { kind: "browse", raw: "" }, radius: null, hidden });
    const s03 = b.listings.filter((l) => l.seller_id === "s03").length;
    expect(r.total).toBe(all.total - 1 - s03);
    expect(r.shown.some((l) => l.id === "204507" || l.seller_id === "s03")).toBe(false);
    expect(r.radiusCounts.get(null)).toBe(r.total);
  });
});

describe("URL parsing", () => {
  const cats = ["phones", "fashion"] as const;
  it("keeps valid filters, swaps reversed prices and ignores junk", () => {
    expect(parseFilters({ cat: "phones", min: "5000", max: "1000" }, cats)).toEqual({ cat: "phones", min: toMinor(1000), max: toMinor(5000) });
    expect(parseFilters({ cat: "weapons", min: "-5", max: "1e3" }, cats)).toEqual({});
    expect(parsePage("3")).toBe(3);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("999")).toBe(1);
  });
});
