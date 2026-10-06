import { describe, expect, it } from "vitest";
import { repos } from "@/lib/data";
import type { ListingWithSeller } from "@/lib/data/types";
import { haversineKm } from "@/lib/geo";
import { discountPercent, kobo } from "@/lib/money";
import { SORTS, parseSort, sortListings, totalTo, type SortKey } from "./sort";

/** Small seeded PRNG (mulberry32), so a failing case can be replayed. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random listings built on real fixture shapes: prices, dates, places and discounts vary. */
async function randomListings(seed: number, n: number): Promise<ListingWithSeller[]> {
  const base = await repos.listings.list();
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const t = base[Math.floor(r() * base.length)];
    const price = Math.floor(r() * 5_000_000_00) + 1; // up to ₦5m, any kobo
    const tie = r() < 0.2; // plenty of equal prices to test tie-breaks
    return {
      ...t,
      id: `R${seed}x${i}`,
      price_minor: kobo(tie ? 100_000_00 : price),
      was_minor: r() < 0.3 ? kobo(price + Math.floor(r() * price)) : undefined,
      created_at: new Date(Date.parse("2026-10-06T00:00:00Z") - Math.floor(r() * 60 * 86_400_000)).toISOString(),
      location: { ...t.location, lat: 4 + r() * 9, lng: 3 + r() * 10 },
    };
  });
}

const monotonic = (xs: number[], dir: 1 | -1) => xs.every((x, i) => i === 0 || (x - xs[i - 1]) * dir >= 0);

describe("sortListings", () => {
  it("is monotonic in the canonical NGN total for every price sort, over random data (Sprint 0 #3)", async () => {
    for (let seed = 1; seed <= 200; seed++) {
      const list = await randomListings(seed, 1 + (seed % 60));
      for (const city of [undefined, "Lagos", "Kano"]) {
        for (const [key, dir] of [["price_asc", 1], ["price_desc", -1]] as const) {
          const totals = sortListings(list, key, { city }).map((l) => totalTo(l, city));
          const reachable = totals.filter((t): t is number => t !== null);
          // Everything that reaches the buyer first, in order; the rest after.
          expect(totals.slice(0, reachable.length)).toEqual(reachable);
          expect(monotonic(reachable, dir), `seed ${seed} ${key} ${city}`).toBe(true);
        }
      }
    }
  });

  it("orders newest, nearest and discount correctly", async () => {
    const anchor = { lat: 6.4474, lng: 3.4723 };
    for (let seed = 1; seed <= 50; seed++) {
      const list = await randomListings(seed, 40);
      expect(monotonic(sortListings(list, "newest").map((l) => Date.parse(l.created_at)), -1)).toBe(true);
      expect(monotonic(sortListings(list, "nearest", { anchor }).map((l) => haversineKm(anchor, l.location)), 1)).toBe(true);
      expect(monotonic(sortListings(list, "discount").map((l) => discountPercent(l.price_minor, l.was_minor) ?? -1), -1)).toBe(true);
    }
  });

  it("keeps every item, breaks ties on id and never mutates its input", async () => {
    const list = await randomListings(7, 50);
    const before = list.map((l) => l.id);
    for (const { key } of SORTS) {
      const sorted = sortListings(list, key, { anchor: { lat: 6.5, lng: 3.4 }, now: Date.parse("2026-10-06T00:00:00Z") });
      expect(sorted.map((l) => l.id).sort()).toEqual([...before].sort());
      expect(sortListings(list, key, { anchor: { lat: 6.5, lng: 3.4 }, now: Date.parse("2026-10-06T00:00:00Z") })).toEqual(sorted);
    }
    expect(list.map((l) => l.id)).toEqual(before);
    const sorted = sortListings(list, "price_asc");
    const tied = sorted.filter((l) => sorted.some((m) => m !== l && totalTo(m) === totalTo(l)));
    for (const t of new Set(tied.map((l) => totalTo(l)))) {
      const ids = tied.filter((l) => totalTo(l) === t).map((l) => l.id);
      expect(ids).toEqual([...ids].sort());
    }
  });

  it("lets text relevance lead best match", async () => {
    const list = await repos.listings.list();
    const target = list.find((l) => l.title.includes("Kettle"))!;
    const sorted = sortListings(list, "best", { relevance: new Map(list.map((l) => [l.id, l.id === target.id ? 1 : 0])) });
    expect(sorted[0].id).toBe(target.id);
  });

  it("falls back to best match for nearest without an anchor", async () => {
    const list = await repos.listings.list();
    expect(sortListings(list, "nearest")).toEqual(sortListings(list, "best"));
  });
});

describe("parseSort", () => {
  it("accepts known keys and defaults to best match", () => {
    const keys: SortKey[] = ["best", "price_asc", "price_desc", "newest", "nearest", "discount"];
    for (const k of keys) expect(parseSort(k)).toBe(k);
    expect(parseSort(undefined)).toBe("best");
    expect(parseSort("drop table")).toBe("best");
    expect(parseSort(["price_desc", "newest"])).toBe("price_desc");
  });
});
