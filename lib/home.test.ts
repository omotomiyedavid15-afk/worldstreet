import { describe, expect, it } from "vitest";
import { rules } from "@/config/marketplace-rules";
import { findArea } from "@/lib/areas";
import { repos } from "@/lib/data";
import { haversineKm } from "@/lib/geo";
import { discountPercent } from "@/lib/money";
import { categoryTiles, homeRails, nearbyCount } from "./home";
import { runSearch } from "./search/run";

const lagos = findArea("lagos")!;
const abuja = findArea("abuja")!;
const data = async () => ({ listings: await repos.listings.list(), categories: await repos.categories.list() });

describe("categoryTiles (R-016)", () => {
  it("counts exactly what /search?cat= shows at the default radius", async () => {
    const { listings, categories } = await data();
    for (const tile of categoryTiles({ listings, categories, anchor: lagos })) {
      const radius = tile.scope === "radius" ? rules.location.defaultRadiusKm : null;
      const search = runSearch({ listings, query: { kind: "browse", raw: "" }, filters: { cat: tile.category.id }, anchor: lagos, radius, sort: "best", page: 1 });
      expect(tile.count, tile.category.id).toBe(search.total);
    }
  });

  it("labels a category with nothing nearby as nationwide, with its nationwide count", async () => {
    const { listings, categories } = await data();
    const tiles = categoryTiles({ listings, categories, anchor: abuja });
    const fashion = tiles.find((t) => t.category.id === "fashion")!;
    expect(fashion.scope).toBe("nationwide");
    expect(fashion.count).toBe(listings.filter((l) => l.category_id === "fashion").length);
  });

  it("leaves hidden listings out of the counts", async () => {
    const { listings, categories } = await data();
    const phone = listings.find((l) => l.category_id === "phones" && haversineKm(lagos, l.location) <= 25)!;
    const before = categoryTiles({ listings, categories, anchor: lagos }).find((t) => t.category.id === "phones")!;
    const after = categoryTiles({ listings, categories, anchor: lagos, hidden: { listings: new Set([phone.id]), sellers: new Set() } }).find(
      (t) => t.category.id === "phones",
    )!;
    expect(after.count).toBe(before.count - 1);
  });

  it("follows the buyer's radius, and nationwide counts everything", async () => {
    const { listings, categories } = await data();
    for (const radius of [5, 10, null] as const) {
      for (const tile of categoryTiles({ listings, categories, anchor: lagos, radius })) {
        const r = tile.scope === "radius" ? radius : null;
        const search = runSearch({ listings, query: { kind: "browse", raw: "" }, filters: { cat: tile.category.id }, anchor: lagos, radius: r, sort: "best", page: 1 });
        expect(tile.count, `${tile.category.id} at ${radius}`).toBe(search.total);
      }
    }
    expect(categoryTiles({ listings, categories, anchor: lagos, radius: null }).every((t) => t.scope === "radius")).toBe(true);
  });
});

describe("nearbyCount", () => {
  it("is the browse total /search shows", async () => {
    const { listings } = await data();
    const search = runSearch({ listings, query: { kind: "browse", raw: "" }, filters: {}, anchor: lagos, radius: 10, sort: "best", page: 1 });
    expect(nearbyCount({ listings, anchor: lagos, radius: 10 })).toBe(search.total);
  });
});

describe("homeRails", () => {
  it("never shows a listing twice on the page (R-013)", async () => {
    const { listings } = await data();
    const rails = Object.values(homeRails({ listings, anchor: lagos })).filter((r) => r !== null);
    const ids = rails.flatMap((r) => r.listings.map((l) => l.id));
    expect(rails.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("collapses a rail with fewer than the minimum items (R-014)", async () => {
    const { listings } = await data();
    // Two discounted listings nearby: too few for a Deals rail.
    const deals = listings.filter((l) => discountPercent(l.price_minor, l.was_minor) !== null).slice(0, 2);
    const rest = listings.filter((l) => l.was_minor === undefined);
    const rails = homeRails({ listings: [...deals, ...rest], anchor: lagos });
    expect(rails.deals).toBeNull();
    for (const rail of Object.values(rails)) if (rail) expect(rail.listings.length).toBeGreaterThanOrEqual(rules.home.minRailItems);
  });

  it("keeps every rail inside the buyer's radius and in its own order", async () => {
    const { listings } = await data();
    const rails = homeRails({ listings, anchor: lagos });
    for (const rail of Object.values(rails)) {
      for (const l of rail?.listings ?? []) expect(haversineKm(lagos, l.location)).toBeLessThanOrEqual(rules.location.defaultRadiusKm);
    }
    const near = rails.near!.listings.map((l) => haversineKm(lagos, l.location));
    expect(near).toEqual([...near].sort((a, b) => a - b));
    const off = rails.deals!.listings.map((l) => discountPercent(l.price_minor, l.was_minor)!);
    expect(off).toEqual([...off].sort((a, b) => b - a));
    expect(rails.near!.listings.length).toBeLessThanOrEqual(rules.home.railMax);
    expect(rails.new!.listings.length).toBeLessThanOrEqual(rules.home.moreMax);
  });

  it("falls back to one nationwide rail when nothing is near (F6)", async () => {
    const { listings } = await data();
    const kano = findArea("kano")!;
    const rails = homeRails({ listings, anchor: kano });
    expect(rails.near).toBeNull();
    expect(rails.nationwide!.listings.length).toBeGreaterThanOrEqual(rules.home.minRailItems);
    expect(homeRails({ listings, anchor: lagos }).nationwide).toBeNull();
  });

  it("drops hidden listings and sellers", async () => {
    const { listings } = await data();
    const first = homeRails({ listings, anchor: lagos }).near!.listings[0];
    const rails = homeRails({ listings, anchor: lagos, hidden: { listings: new Set(), sellers: new Set([first.seller_id]) } });
    for (const rail of Object.values(rails)) for (const l of rail?.listings ?? []) expect(l.seller_id).not.toBe(first.seller_id);
  });
});
