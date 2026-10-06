import { describe, expect, it } from "vitest";
import { rules } from "@/config/marketplace-rules";
import { repos } from "@/lib/data";
import { suggest } from "./suggest";

const data = async () => ({
  listings: await repos.listings.list(),
  categories: await repos.categories.list(),
  sellers: await repos.sellers.list(),
  trending: await repos.search.trending(),
});

describe("suggest (B2 step 2)", () => {
  it("waits for two characters", async () => {
    expect(suggest({ ...(await data()), typed: "h" })).toEqual([]);
  });

  it("completes, scopes to categories and names matching listings", async () => {
    const s = suggest({ ...(await data()), typed: "head" });
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(rules.search.maxSuggestions);
    expect(s.some((x) => x.kind === "query" && x.text.startsWith("head"))).toBe(true);
    expect(s).toContainEqual({ kind: "category", text: "head", cat: "electronics", name: "Electronics" });
    for (const x of s.filter((y) => y.kind === "listing")) expect(x.text).toMatch(/head/i);
  });

  it("understands local spellings (EC-003)", async () => {
    const s = suggest({ ...(await data()), typed: "fone" });
    expect(s.some((x) => x.kind === "listing")).toBe(true);
  });

  it("finds sellers by shop name", async () => {
    const s = suggest({ ...(await data()), typed: "gadget" });
    expect(s).toContainEqual(expect.objectContaining({ kind: "seller", href: "/seller/gadgethub-ikeja" }));
  });

  it("offers nothing for a prohibited search (EC-004)", async () => {
    expect(suggest({ ...(await data()), typed: "pistol grip" })).toEqual([]);
  });

  it("caps rows at the phone limit when asked", async () => {
    expect(suggest({ ...(await data()), typed: "ph", max: rules.search.maxSuggestionsPhone }).length).toBeLessThanOrEqual(rules.search.maxSuggestionsPhone);
  });
});
