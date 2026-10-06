import { describe, expect, it } from "vitest";
import { repos } from "@/lib/data";
import { correct, editDistance, vocabulary } from "./spell";

describe("editDistance", () => {
  it("counts a missing, extra, wrong or swapped letter as one edit", () => {
    expect(editDistance("headphones", "headphnes")).toBe(1);
    expect(editDistance("kettle", "kettel")).toBe(1);
    expect(editDistance("sofa", "sofaa")).toBe(1);
    expect(editDistance("laptop", "laptip")).toBe(1);
    expect(editDistance("phone", "drone", 1)).toBeGreaterThan(1);
  });
});

describe("correct (Did you mean)", () => {
  it("fixes words that match nothing and leaves good ones alone", async () => {
    const vocab = vocabulary(await repos.listings.list(), await repos.categories.list());
    expect(correct("sony headphnes", vocab)).toBe("sony headphones");
    expect(correct("generatr", vocab)).toBe("generator");
    expect(correct("headphones", vocab)).toBeNull();
    expect(correct("fone", vocab)).toBeNull(); // a local spelling, already understood (EC-003)
    expect(correct("tv", vocab)).toBeNull(); // too short to correct safely
  });
});
