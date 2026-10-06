import { describe, expect, it } from "vitest";
import { haversineKm, withinRadius } from "./geo";

const ikeja = { lat: 6.6018, lng: 3.3515 };
const lekki = { lat: 6.4698, lng: 3.5852 };
const abuja = { lat: 9.0765, lng: 7.3986 };

describe("geo", () => {
  it("is zero for the same point and symmetric", () => {
    expect(haversineKm(ikeja, ikeja)).toBe(0);
    expect(haversineKm(ikeja, lekki)).toBeCloseTo(haversineKm(lekki, ikeja), 9);
  });

  it("matches known distances", () => {
    expect(haversineKm(ikeja, lekki)).toBeCloseTo(29.7, 0);
    expect(haversineKm(ikeja, abuja)).toBeGreaterThan(520);
    expect(haversineKm(ikeja, abuja)).toBeLessThan(540);
  });

  it("filters by radius, with null as nationwide", () => {
    expect(withinRadius(ikeja, lekki, 25)).toBe(false);
    expect(withinRadius(ikeja, lekki, 30)).toBe(true);
    expect(withinRadius(ikeja, abuja, null)).toBe(true);
  });
});
