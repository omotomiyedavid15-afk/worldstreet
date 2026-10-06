/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by mocks/fixtures. */

import type { CategoryId, Condition, DeliveryOption, Listing, ListingFormat, ListingStatus } from "@/lib/data/types";
import { toMinor } from "@/lib/money";
import { places, type PlaceKey } from "./fixtures/places";

/** Mock flat fees by zone (PLAN risk 1), in naira for readability. */
export const delivery = {
  lagos: [
    { method: "rider", fee_minor: toMinor(2_500), eta_days: [1, 2] },
    { method: "pickup_station", fee_minor: toMinor(1_500), eta_days: [2, 3] },
    { method: "meet_up", fee_minor: toMinor(0), eta_days: [0, 1] },
  ],
  free: [{ method: "courier", fee_minor: toMinor(0), eta_days: [2, 4] }],
  nationwide: [
    { method: "courier", fee_minor: toMinor(4_500), eta_days: [3, 5] },
    { method: "pickup_station", fee_minor: toMinor(3_000), eta_days: [3, 6] },
  ],
  pickup: [{ method: "meet_up", fee_minor: toMinor(0), eta_days: [0, 1] }],
  bulky: [{ method: "rider", fee_minor: toMinor(15_000), eta_days: [2, 4] }],
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
  sold?: number;
  watchers?: number;
  inCarts?: number;
};

/** Fixed "now" so fixtures and tests are deterministic. */
export const MOCK_NOW = Date.parse("2026-10-06T09:00:00Z");

export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

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
    qty: seed.qty ?? 1,
    format: seed.format ?? (offers ? "best_offer" : "buy_now"),
    offers_enabled: offers,
    ...(offers && { auto_decline_minor: toMinor(Math.round(seed.price * 0.6)) }),
    location: places[seed.place],
    delivery: delivery[seed.delivery],
    return_days: seed.returns === undefined ? 7 : seed.returns,
    media: Array.from({ length: photos }, (_, i) => ({
      url: `/mock/img/${seed.category}.svg`,
      alt: i === 0 ? seed.title : `${seed.title}, photo ${i + 1}`,
      order: i,
      type: "image" as const,
      width: 800,
      height: 800,
    })),
    attributes: Object.entries(seed.attributes ?? {}).map(([key, value]) => ({ key, value })),
    status: seed.status ?? "live",
    created_at: new Date(MOCK_NOW - seed.daysAgo * 86_400_000).toISOString(),
    ...(seed.rating && { rating: { average: seed.rating[0], count: seed.rating[1] } }),
    ...(seed.sold !== undefined && { sold_count: seed.sold }),
    ...(seed.watchers !== undefined && { watchers: seed.watchers }),
    ...(seed.inCarts !== undefined && { in_carts: seed.inCarts }),
  };
}
