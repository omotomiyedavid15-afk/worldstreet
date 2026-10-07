import { describe, expect, it } from "vitest";
import { repos } from "@/lib/data";
import { matchListings, parseQuery } from "./query";

const titles = async (q: string) => {
  const parsed = parseQuery(q);
  if (parsed.kind !== "text") throw new Error(`not a text query: ${parsed.kind}`);
  const listings = await repos.listings.list();
  const hits = matchListings(listings, parsed.tokens, parsed.raw);
  return listings.filter((l) => hits.has(l.id)).map((l) => l.title);
};

describe("parseQuery", () => {
  it("treats empty and stop-word-only queries as browsing (EC-001)", () => {
    expect(parseQuery(undefined).kind).toBe("browse");
    expect(parseQuery("   ").kind).toBe("browse");
    expect(parseQuery("the and for me").kind).toBe("browse");
  });

  it("spots a listing id or link (EC-002)", () => {
    expect(parseQuery("204507")).toMatchObject({ kind: "listing-id", id: "204507" });
    expect(parseQuery("https://worldstore.ng/listing/204507-sony-wh")).toMatchObject({ kind: "listing-id", id: "204507" });
    expect(parseQuery("2045071").kind).toBe("text");
  });

  it("flags prohibited searches without echoing suggestions (EC-004)", () => {
    expect(parseQuery("cheap Pistol").kind).toBe("prohibited");
    expect(parseQuery("glue gun").kind).toBe("prohibited");
  });

  it("drops stop words, expands local spellings and normalises accents (EC-003)", () => {
    expect(parseQuery("a fone for me")).toMatchObject({ kind: "text", tokens: ["phone"] });
    expect(parseQuery("Café TV")).toMatchObject({ tokens: ["cafe", "tv"] });
  });
});

describe("matchListings", () => {
  it("finds the headphones for 'head' (Sprint 0 #2)", async () => {
    const found = await titles("head");
    expect(found.some((t) => t.includes("Headphones"))).toBe(true);
    expect(found.every((t) => /head/i.test(t))).toBe(true);
  });

  it("needs every word to match somewhere", async () => {
    expect(await titles("sony headphones")).toEqual(["Sony WH-1000XM5 Wireless Noise Cancelling Headphones"]);
    expect(await titles("sony kettle")).toEqual([]);
  });

  it("matches categories and attributes, not just titles", async () => {
    expect((await titles("fashion")).length).toBeGreaterThan(2);
    expect(await titles("automatic")).toEqual(expect.arrayContaining(["Toyota Corolla 2014 LE, Automatic", "Honda Accord 2013 EX-L"]));
  });

  it("doesn't match on the shop name alone", async () => {
    expect(await titles("gadget")).toEqual([]); // "Gadget Hub Ikeja" sells phones, but no listing is a gadget
  });

  it("ranks title matches above category matches", async () => {
    const [base] = await repos.listings.list();
    const inTitle = { ...base, id: "T1", title: "Zebra print scarf" };
    const inCategory = { ...base, id: "T2", title: "Striped scarf", category: { ...base.category, name: "Zebra goods" } };
    const hits = matchListings([inTitle, inCategory], ["zebra"], "zebra");
    expect(hits.get("T1")!).toBeGreaterThan(hits.get("T2")!);
  });
});
