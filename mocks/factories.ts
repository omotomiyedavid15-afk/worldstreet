/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by mocks/fixtures. */

import type { CategoryId, Condition, DeliveryOption, Listing, ListingFormat, ListingRevision, ListingStatus, Review, ReviewTopic } from "@/lib/data/types";
import { slugify } from "@/lib/format";
import { toMinor } from "@/lib/money";
import { places, type PlaceKey } from "./fixtures/places";

/** Mock flat fees by zone (PLAN risk 1), in naira for readability. */
export const delivery = {
  lagos: [
    { method: "rider", fee_minor: toMinor(2_500), eta_days: [1, 2], coverage: "same_city" },
    { method: "pickup_station", fee_minor: toMinor(1_500), eta_days: [2, 3], coverage: "same_city" },
    { method: "meet_up", fee_minor: toMinor(0), eta_days: [0, 1], coverage: "same_city" },
    { method: "courier", fee_minor: toMinor(4_500), eta_days: [3, 5], coverage: "nationwide" },
  ],
  free: [{ method: "courier", fee_minor: toMinor(0), eta_days: [2, 4], coverage: "nationwide" }],
  nationwide: [
    { method: "courier", fee_minor: toMinor(4_500), eta_days: [3, 5], coverage: "nationwide" },
    { method: "pickup_station", fee_minor: toMinor(3_000), eta_days: [3, 6], coverage: "nationwide" },
  ],
  pickup: [{ method: "meet_up", fee_minor: toMinor(0), eta_days: [0, 1], coverage: "same_city" }],
  bulky: [{ method: "rider", fee_minor: toMinor(15_000), eta_days: [2, 4], coverage: "same_city" }],
} as const satisfies Record<string, readonly DeliveryOption[]>;

export type ListingSeed = {
  id: string;
  title: string;
  category: CategoryId;
  seller: string;
  place: PlaceKey;
  condition: Condition;
  /** Naira, converted to kobo here so fixtures read like a price tag. */
  price: number;
  was?: number;
  period?: Listing["price_period"];
  format?: ListingFormat;
  offers?: boolean;
  delivery: keyof typeof delivery;
  returns?: 3 | 7 | 14 | null;
  photos?: number;
  daysAgo: number;
  status?: ListingStatus;
  qty?: number;
  attributes?: Record<string, string>;
  description?: string;
  rating?: [average: number, count: number];
  /** Seller notes on condition (spec §7). */
  notes?: string;
  /** Days ago the description was last edited, logged as a revision (R-112). */
  editedDaysAgo?: number;
  sold?: number;
  watchers?: number;
};

/** Revisions a listing's own data implies (R-112): a struck-through price means the price
 *  was lowered after listing, so the history shows that change; an edited description is
 *  logged when the seed says so. Oldest first. */
function revisionsFor(seed: ListingSeed): ListingRevision[] {
  const day = 86_400_000;
  const created = MOCK_NOW - seed.daysAgo * day;
  const out: ListingRevision[] = [];
  if (seed.was !== undefined) {
    out.push({ at: new Date(created + (seed.daysAgo * day) / 2).toISOString(), change: "price", from_minor: toMinor(seed.was), to_minor: toMinor(seed.price) });
  }
  if (seed.editedDaysAgo !== undefined && seed.editedDaysAgo < seed.daysAgo) {
    out.push({ at: new Date(MOCK_NOW - seed.editedDaysAgo * day).toISOString(), change: "description" });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

/** Fixed "now" so fixtures and tests are deterministic. */
export const MOCK_NOW = Date.parse("2026-10-06T09:00:00Z");

export function makeListing(seed: ListingSeed): Listing {
  const photos = seed.photos ?? 4;
  const offers = seed.offers ?? seed.format === "best_offer";
  return {
    id: seed.id,
    slug: slugify(seed.title),
    seller_id: seed.seller,
    category_id: seed.category,
    title: seed.title,
    description: seed.description ?? `${seed.title}. Mock listing for development; not a real item.`,
    condition: seed.condition,
    price_minor: toMinor(seed.price),
    ...(seed.was !== undefined && { was_minor: toMinor(seed.was) }),
    ...(seed.period && { price_period: seed.period }),
    qty: seed.qty ?? 1,
    format: seed.format ?? (offers ? "best_offer" : "buy_now"),
    offers_enabled: offers,
    ...(offers && { auto_decline_minor: toMinor(Math.round(seed.price * 0.6)) }),
    location: places[seed.place],
    delivery: delivery[seed.delivery],
    return_days: seed.returns === undefined ? 7 : seed.returns,
    media: Array.from({ length: photos }, (_, i) => ({
      url: `/mock/img/${seed.category}-${(i % 4) + 1}.svg`,
      alt: i === 0 ? seed.title : `${seed.title}, photo ${i + 1}`,
      order: i,
      type: "image" as const,
      width: 800,
      height: 800,
    })),
    attributes: Object.entries(seed.attributes ?? {}).map(([key, value]) => ({ key, value })),
    status: seed.status ?? "live",
    ...(seed.notes && { seller_notes: seed.notes }),
    ...(revisionsFor(seed).length > 0 && { revisions: revisionsFor(seed) }),
    created_at: new Date(MOCK_NOW - seed.daysAgo * 86_400_000).toISOString(),
    ...(seed.sold !== undefined && { sold_count: seed.sold }),
    ...(seed.watchers !== undefined && { watchers: seed.watchers }),
  };
}

/* ── Reviews ────────────────────────────────────────────────────────────────────────
   Mock reviews are generated from each seed's `rating: [average, count]`: exactly
   `count` records whose stars sum to the nearest whole number to average × count. The
   listing's displayed rating is then computed from these records (withItemRating), so
   a card, the listing page and the reviews list can never disagree. Deterministic per
   listing id, so tests and screenshots are stable. */

function prng(seedText: string) {
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const REVIEW_TEXT: Record<Review["rating"], readonly [string, readonly ReviewTopic[]][]> = {
  5: [
    ["Exactly as described and it arrived quickly. Very happy with it.", ["as_described", "delivery"]],
    ["Well packed and the seller kept me updated the whole way.", ["packaging", "communication"]],
    ["Great value for the price. I'd buy from this seller again.", ["value"]],
    ["Works perfectly. The rider called before arriving.", ["quality", "delivery"]],
    ["Original item, I checked the serial number at handover. Thank you.", ["as_described", "quality"]],
    ["Smooth from start to finish. Replied to my questions within the hour.", ["communication"]],
    ["Picked it up at the meet-up point, checked it there and scanned the code. Easy.", ["as_described"]],
    ["Second time buying from this shop. Same quality as before.", ["quality"]],
    ["Cheaper than the market and it came sealed.", ["value", "packaging"]],
    ["Delivered the next day to my office. Exactly what I ordered.", ["delivery", "as_described"]],
  ],
  4: [
    ["Good item. A small scuff wasn't mentioned, but it works fine.", ["quality", "as_described"]],
    ["Came a day later than expected, but it's as described.", ["delivery", "as_described"]],
    ["Happy overall. The packaging could be better.", ["packaging"]],
    ["Good value. The seller took a while to reply.", ["value", "communication"]],
  ],
  3: [
    ["It works, but the battery is weaker than the listing said.", ["as_described", "quality"]],
    ["Okay for the price. Delivery was slow.", ["value", "delivery"]],
  ],
  2: [
    ["Not quite as described. The seller offered a partial refund.", ["as_described"]],
    ["Took a week to arrive and the box was damaged.", ["delivery", "packaging"]],
  ],
  1: [["It stopped working after a day. I reported it and got my money back through escrow.", ["quality"]]],
};

const BUYERS = ["olamide", "chiamaka", "tunde", "aisha", "emeka", "ngozi", "bayo", "fatima", "ifeanyi", "kemi", "segun", "zainab", "uche", "funmi", "yusuf", "adaeze"];
const mask = (name: string) => `${name[0]}***${name[name.length - 1]}`;
const clamp = (n: number) => Math.min(5, Math.max(1, Math.round(n)));

export function makeReviews(seed: ListingSeed, sellerJoinedAt: string): Review[] {
  if (!seed.rating) return [];
  const [average, count] = seed.rating;
  const rand = prng(seed.id);
  // Start at five stars and take stars away until the total matches the average.
  const stars = Array.from({ length: count }, () => 5);
  let deficit = 5 * count - Math.round(average * count);
  const order = stars.map((_, i) => i).sort(() => rand() - 0.5);
  while (deficit > 0) {
    for (const i of order) {
      if (deficit === 0) break;
      if (stars[i] > 1 && (stars[i] < 5 || rand() < 0.8)) {
        stars[i] -= 1;
        deficit -= 1;
      }
    }
  }
  const from = Math.max(Date.parse(sellerJoinedAt), MOCK_NOW - 420 * 86_400_000);
  return stars.map((rating, i) => {
    const pool = REVIEW_TEXT[rating as Review["rating"]];
    const [text, topics] = pool[Math.floor(rand() * pool.length)];
    const created = from + rand() * (MOCK_NOW - 86_400_000 - from);
    const dim = (bias: number) => clamp(rating + bias + (rand() - 0.5));
    const replies = rating <= 3 || rand() < 0.1;
    return {
      id: `${seed.id}-r${i + 1}`,
      listing_id: seed.id,
      seller_id: seed.seller,
      buyer: mask(BUYERS[Math.floor(rand() * BUYERS.length)]),
      buyer_feedback_count: 1 + Math.floor(rand() * 240),
      rating: rating as Review["rating"],
      dimensions: { accuracy: dim(0), delivery: dim(0.2), communication: dim(0.3), packaging: dim(0.1) },
      text,
      topics,
      created_at: new Date(created).toISOString(),
      ...(replies && {
        reply: {
          text: rating <= 3 ? "Sorry about this. We've sorted it with you and changed how we pack and check items." : "Thank you for buying from us!",
          created_at: new Date(Math.min(created + 86_400_000, MOCK_NOW)).toISOString(),
        },
      }),
    };
  });
}

/** The listing's item rating, computed from its reviews (never typed in). */
export function withItemRating(listing: Listing, reviews: readonly Review[]): Listing {
  const own = reviews.filter((r) => r.listing_id === listing.id);
  if (!own.length) return listing;
  const average = Math.round((own.reduce((sum, r) => sum + r.rating, 0) / own.length) * 10) / 10;
  return { ...listing, rating: { average, count: own.length } };
}
