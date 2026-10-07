import { describe, expect, it } from "vitest";
import type { Review } from "@/lib/data/types";
import { dimensionAverages, summariseReviews, timeBucket, topicCounts } from "./reviews";

const review = (rating: Review["rating"], extra: Partial<Review> = {}): Review => ({
  id: `r${Math.random()}`,
  listing_id: "l1",
  seller_id: "s1",
  buyer: "o***a",
  buyer_feedback_count: 3,
  rating,
  dimensions: { accuracy: rating, delivery: rating, communication: 5, packaging: 4 },
  text: "",
  topics: [],
  created_at: "2026-10-01T00:00:00Z",
  ...extra,
});

describe("summariseReviews", () => {
  it("averages to one decimal and counts each star", () => {
    const s = summariseReviews([review(5), review(5), review(4), review(1)]);
    expect(s.count).toBe(4);
    expect(s.average).toBe(3.8); // 15 / 4 = 3.75 → 3.8
    expect(s.distribution).toEqual([
      { stars: 5, count: 2 },
      { stars: 4, count: 1 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 1 },
    ]);
  });

  it("is empty-safe", () => {
    expect(summariseReviews([])).toMatchObject({ count: 0, average: 0 });
    expect(dimensionAverages([])).toBeNull();
  });
});

describe("dimensionAverages", () => {
  it("averages each of the four seller ratings", () => {
    expect(dimensionAverages([review(5), review(3)])).toEqual({ accuracy: 4, delivery: 4, communication: 5, packaging: 4 });
  });
});

describe("topicCounts", () => {
  it("orders topics by how often they come up", () => {
    const counts = topicCounts([review(5, { topics: ["delivery", "value"] }), review(4, { topics: ["delivery"] })]);
    expect(counts).toEqual([
      { topic: "delivery", label: "Delivery", count: 2 },
      { topic: "value", label: "Value", count: 1 },
    ]);
  });
});

describe("timeBucket", () => {
  const now = Date.parse("2026-10-06T00:00:00Z");
  it("buckets by age like eBay", () => {
    expect(timeBucket("2026-09-20T00:00:00Z", now)).toBe("Past month");
    expect(timeBucket("2026-06-01T00:00:00Z", now)).toBe("Past 6 months");
    expect(timeBucket("2026-01-01T00:00:00Z", now)).toBe("Past year");
    expect(timeBucket("2025-01-01T00:00:00Z", now)).toBe("More than a year ago");
  });
});
