import { describe, expect, it } from "vitest";
import { AREAS, findArea, nearestArea } from "@/lib/areas";
import { repos } from "@/lib/data";
import { haversineKm } from "@/lib/geo";
import { hrefWith } from "./params";
import { RADII, countsByRadius, filterByRadius, parseRadius, radiusParam, widerRadius } from "./radius";

describe("location radius (Sprint 0 #4, R-001, R-016)", () => {
  it("never shows an item beyond the radius, for every radius × anchor", async () => {
    const listings = await repos.listings.list();
    for (const anchor of AREAS) {
      const counts = countsByRadius(listings, anchor);
      for (const radius of RADII) {
        const shown = filterByRadius(listings, anchor, radius);
        if (radius !== null) for (const l of shown) expect(haversineKm(anchor, l.location), `${anchor.id} ${radius}km ${l.id}`).toBeLessThanOrEqual(radius);
        // Nothing within the radius is dropped either.
        const missing = listings.filter((l) => !shown.includes(l) && (radius === null || haversineKm(anchor, l.location) <= radius));
        expect(missing).toEqual([]);
        // Counts match what's shown.
        expect(counts.get(radius)).toBe(shown.length);
      }
      // Wider radii never show fewer items.
      const sizes = RADII.map((r) => counts.get(r)!);
      expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    }
  });

  it("shows something nearby in Lagos and everything nationwide", async () => {
    const listings = await repos.listings.list();
    const lekki = findArea("lekki")!;
    expect(filterByRadius(listings, lekki, 10).length).toBeGreaterThan(3);
    expect(filterByRadius(listings, lekki, null)).toHaveLength(listings.length);
  });
});

describe("radius params", () => {
  it("parses the URL value, defaulting to 25 km", () => {
    expect(parseRadius("5")).toBe(5);
    expect(parseRadius("10")).toBe(10);
    expect(parseRadius("all")).toBeNull();
    expect(parseRadius(undefined)).toBe(25);
    expect(parseRadius("7")).toBe(25);
    expect(parseRadius("1e9")).toBe(25);
    for (const r of RADII) expect(parseRadius(radiusParam(r))).toBe(r);
  });
});

describe("areas", () => {
  it("finds the nearest named area to a device position", () => {
    expect(nearestArea({ lat: 6.45, lng: 3.47 }).id).toBe("lekki");
    expect(nearestArea({ lat: 9.07, lng: 7.47 }).id).toBe("wuse");
    expect(findArea("nowhere")).toBeUndefined();
  });
});

describe("hrefWith", () => {
  it("changes one value, keeps the rest and resets paging", () => {
    expect(hrefWith("/search", { q: "phone", sort: "newest", page: "3" }, "sort", "price_asc")).toBe("/search?q=phone&sort=price_asc");
    expect(hrefWith("/search", { q: "phone", sort: "newest" }, "sort", null)).toBe("/search?q=phone");
    expect(hrefWith("/search", {}, "radius", "all")).toBe("/search?radius=all");
    expect(hrefWith("/search", { cond: ["new", "used"] }, "q", "tv")).toBe("/search?cond=new&cond=used&q=tv");
  });
});

describe("widerRadius", () => {
  const counts = new Map([[5, 0], [10, 0], [25, 3], [null, 9]] as const);
  it("finds the first wider radius with more results", () => {
    expect(widerRadius(5, counts, 0)).toBe(25);
    expect(widerRadius(25, counts, 3)).toBeNull(); // nationwide
    expect(widerRadius(null, counts, 9)).toBeUndefined();
    expect(widerRadius(25, new Map([[25, 3], [null, 3]] as const), 3)).toBeUndefined();
  });
});
