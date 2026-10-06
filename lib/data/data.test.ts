import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { haversineKm } from "@/lib/geo";
import { BUYER_VISIBLE, listingPath, parseListingParam, repos } from "./index";
import { createMemoryRepos } from "./memory";

const all = () => repos.listings.list({ status: ["draft", "in_review", "live", "rejected", "paused", "reserved", "sold", "ended", "removed"] });

describe("fixtures", () => {
  it("has about 40 listings with unique, hyphen-free ids", async () => {
    const listings = await all();
    expect(listings.length).toBeGreaterThanOrEqual(40);
    expect(new Set(listings.map((l) => l.id)).size).toBe(listings.length);
    for (const l of listings) expect(l.id).not.toContain("-");
  });

  it("stores every amount as integer kobo, NGN only (R-002, EC-028)", async () => {
    for (const l of await all()) {
      const amounts = [l.price_minor, l.was_minor, l.auto_accept_minor, l.auto_decline_minor, ...l.delivery.map((d) => d.fee_minor)];
      for (const amount of amounts.filter((a) => a !== undefined)) {
        expect(Number.isSafeInteger(amount), `${l.id} ${amount}`).toBe(true);
        expect(amount).toBeGreaterThanOrEqual(0);
      }
      expect(Object.keys(l).some((k) => /currency/i.test(k))).toBe(false);
      if (l.was_minor !== undefined) expect(l.was_minor).toBeGreaterThan(l.price_minor);
      if (l.auto_decline_minor !== undefined) expect(l.auto_decline_minor).toBeLessThan(l.price_minor);
    }
  });

  it("places every listing inside Nigeria, at area level", async () => {
    for (const l of await all()) {
      expect(l.location.lat).toBeGreaterThan(4);
      expect(l.location.lat).toBeLessThan(14);
      expect(l.location.lng).toBeGreaterThan(2.6);
      expect(l.location.lng).toBeLessThan(14.7);
      expect(l.location.area).toBeTruthy();
    }
  });

  it("spreads listings so radius filters have something to cut", async () => {
    const ikeja = { lat: 6.5833, lng: 3.3557 };
    const distances = (await all()).map((l) => haversineKm(ikeja, l.location));
    expect(distances.filter((d) => d <= 10).length).toBeGreaterThan(5);
    expect(distances.filter((d) => d > 10 && d <= 25).length).toBeGreaterThan(5);
    expect(distances.filter((d) => d > 100).length).toBeGreaterThan(5);
  });

  it("serves a photo for every media item", async () => {
    for (const l of await all()) {
      expect(l.media.length).toBeGreaterThan(0);
      for (const m of l.media) expect(existsSync(path.join(process.cwd(), "public", m.url)), m.url).toBe(true);
    }
  });

  it("includes headphones for the Sprint 0 search check", async () => {
    const titles = (await repos.listings.list()).map((l) => l.title.toLowerCase());
    expect(titles.some((t) => t.includes("headphones"))).toBe(true);
  });
});

describe("listing repo", () => {
  it("returns only buyer-visible listings by default", async () => {
    const visible = await repos.listings.list();
    expect(visible.length).toBeGreaterThan(0);
    for (const l of visible) expect(BUYER_VISIBLE).toContain(l.status);
    expect((await all()).length).toBeGreaterThan(visible.length);
  });

  it("joins the seller and category", async () => {
    const l = await repos.listings.get("204507");
    expect(l?.seller.handle).toBe("gadgethub-ikeja");
    expect(l?.category.id).toBe("electronics");
    expect(await repos.listings.get("nope")).toBeNull();
  });

  it("filters by category, seller and ids", async () => {
    for (const l of await repos.listings.list({ category_id: "fashion" })) expect(l.category_id).toBe("fashion");
    for (const l of await repos.listings.list({ seller_id: "s03" })) expect(l.seller_id).toBe("s03");
    expect((await repos.listings.list({ ids: ["204501", "204518"] })).map((l) => l.id)).toEqual(["204501"]); // 204518 is sold
  });

  it("finds sellers by handle, ignoring case", async () => {
    expect((await repos.sellers.getByHandle("Adire-And-Co"))?.id).toBe("s03");
    expect(await repos.sellers.getByHandle("missing")).toBeNull();
  });

  it("rejects a dataset with a dangling reference", () => {
    expect(() =>
      createMemoryRepos({ categories: [], sellers: [], listings: [{ id: "1", seller_id: "x", category_id: "phones" } as never] }),
    ).toThrow(/unknown seller/);
  });
});

describe("listing URLs", () => {
  it("round-trips /listing/:id-:slug", async () => {
    const l = (await repos.listings.get("204514"))!;
    const href = listingPath(l);
    expect(href).toBe("/listing/204514-macbook-air-m2-13-8gb-256gb-midnight");
    expect(parseListingParam(href.replace("/listing/", ""))).toEqual({ id: "204514", slug: l.slug });
    expect(parseListingParam("204514")).toEqual({ id: "204514", slug: "" });
    expect(parseListingParam("../etc")).toBeNull();
  });
});
