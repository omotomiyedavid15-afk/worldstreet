import { describe, expect, it } from "vitest";
import { cardFacts } from "./facts";

const category = (card_facts: string[]) => ({ id: "phones" as const, name: "Phones", inspection: "phones" as const, kind: "goods" as const, card_facts });

describe("cardFacts", () => {
  it("uses the category's facts in order, worded for a glance", () => {
    const l = { title: "Tecno Camon 20 Pro", category: category(["Storage", "Battery health", "RAM"]), attributes: [{ key: "RAM", value: "8GB" }, { key: "Storage", value: "256GB" }, { key: "Battery health", value: "89%" }] };
    expect(cardFacts(l)).toEqual(["256GB", "Battery 89%", "8GB RAM"]);
    expect(cardFacts(l, 1)).toEqual(["256GB"]);
  });

  it("skips what the title already says", () => {
    const l = { title: "iPhone 14 Pro 256GB Deep Purple", category: category(["Storage", "Battery health"]), attributes: [{ key: "Storage", value: "256GB" }, { key: "Battery health", value: "89%" }] };
    expect(cardFacts(l)).toEqual(["Battery 89%"]);
  });

  it("words property as bed and bath, and says nothing without data", () => {
    const flat = { title: "2-Bedroom Flat", category: category(["Bedrooms", "Bathrooms"]), attributes: [{ key: "Bedrooms", value: "2" }, { key: "Bathrooms", value: "2" }] };
    expect(cardFacts(flat)).toEqual(["2 bath"]); // "2-Bedroom" already says 2 bed
    expect(cardFacts({ ...flat, title: "Flat to Let, Yaba" })).toEqual(["2 bed", "2 bath"]);
    expect(cardFacts({ ...flat, attributes: [] })).toEqual([]);
  });
});
