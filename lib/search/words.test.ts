import { describe, expect, it } from "vitest";
import { suggestionMatch } from "./words";

describe("suggestionMatch", () => {
  it("matches typed words as word prefixes, like results do", () => {
    expect(suggestionMatch("generator", "ge")).toEqual([[0, 2]]);
    expect(suggestionMatch("sony headphones", "head")).toEqual([[5, 9]]); // a later word
    expect(suggestionMatch("sony headphones", "ead")).toBeNull(); // not mid-word
    expect(suggestionMatch("iphone", "i")).toBeNull(); // one letter needs a whole word
  });

  it("needs every typed word, in any order", () => {
    expect(suggestionMatch("sony headphones", "head so")).toEqual([[0, 2], [5, 9]]);
    expect(suggestionMatch("sony headphones", "head tv")).toBeNull();
  });

  it("lets the last word match through a local spelling, highlighting nothing typed", () => {
    expect(suggestionMatch("phone case", "fone")).toEqual([]);
    expect(suggestionMatch("generator", "gen")).toEqual([[0, 3]]); // plain prefix wins
  });

  it("is safe with punctuation and accents", () => {
    expect(() => suggestionMatch("c++ book", "c++")).not.toThrow();
    expect(suggestionMatch("Café latte", "cafe")).toEqual([[0, 4]]);
    expect(suggestionMatch("anything", "")).toEqual([]);
  });
});
