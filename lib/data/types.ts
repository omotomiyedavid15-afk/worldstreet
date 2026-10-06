import type { LatLng } from "@/lib/geo";
import type { Kobo } from "@/lib/money";

/*
 * Data model, flows Part G (minimum viable). Field names follow Part G (snake_case,
 * `*_minor` for money) so the shapes match the eventual API. All money is integer
 * kobo in NGN; there is deliberately no currency field (R-002, EC-028).
 */

export type ISODateTime = string; // UTC (R-006)

export type CategoryId =
  | "phones"
  | "electronics"
  | "computing"
  | "fashion"
  | "home"
  | "appliances"
  | "furniture"
  | "beauty"
  | "vehicles"
  | "property";

export type Category = {
  id: CategoryId;
  name: string;
  /** Escrow inspection window key in config (L4). */
  inspection: "fashion" | "home" | "electronics" | "phones" | "appliances" | "furniture" | "vehicles" | "property" | "default";
  /** Vehicles and property: contact + "Book viewing", no checkout (PLAN risk 7). */
  kind: "goods" | "vehicle" | "property";
  /** Attribute keys worth a place on the card's subtitle line, most useful first. */
  card_facts?: readonly string[];
};

/** spec §5.3 ConditionChip; flows B2 condition filter. */
export type Condition = "new" | "like_new" | "refurbished" | "used" | "for_parts";

/** spec §5.3 FormatChip. Auctions stay behind `rules.flags.auctions`. */
export type ListingFormat = "buy_now" | "best_offer" | "auction";

/** flows §6.1 listing state machine. */
export type ListingStatus = "draft" | "in_review" | "live" | "rejected" | "paused" | "reserved" | "sold" | "ended" | "removed";

/** flows B4/S2 step 5. */
export type DeliveryMethod = "rider" | "pickup_station" | "meet_up" | "courier";

export type DeliveryOption = {
  method: DeliveryMethod;
  /** 0 = free. Mock flat fee by zone until a quote provider exists (PLAN risk 1). */
  fee_minor: Kobo;
  /** Business days after dispatch, inclusive range. */
  eta_days: readonly [number, number];
  /** Riders and meet-ups only work inside the seller's city; couriers go nationwide. */
  coverage: "same_city" | "nationwide";
};

export type Place = LatLng & {
  /** Area or neighbourhood shown to buyers ("Lekki Phase 1"). Never a street address. */
  area: string;
  city: string;
  state: string;
};

/** L4 seller tiers drive payout delay; K3 levels gate limits. */
export type SellerLevel = "new" | "standard" | "trusted";

export type SellerProfile = {
  id: string;
  handle: string;
  shop_name: string;
  area: Place;
  level: SellerLevel;
  verified: boolean;
  top_rated: boolean;
  /** Seller feedback, kept apart from item ratings (audit F13, R-073). */
  feedback: { positive_percent: number; count: number };
  /** "Usually replies within 2 hours" (B5). */
  reply_hours?: number;
  joined_at: ISODateTime;
  /** Show the watcher count publicly once over the threshold (R-025). */
  show_watchers: boolean;
};

export type ListingMedia = {
  url: string;
  alt: string;
  order: number;
  type: "image" | "video";
  width: number;
  height: number;
};

export type ListingAttribute = { key: string; value: string };

export type Listing = {
  id: string;
  slug: string;
  seller_id: string;
  category_id: CategoryId;
  title: string;
  description: string;
  condition: Condition;
  price_minor: Kobo;
  /** Rent and stays: what the price covers ("₦1,800,000 per year"). Absent = one-off price. */
  price_period?: "night" | "month" | "year";
  /** Strike-through price. Only allowed after ≥ 7 days at the higher price (S2 step 4). */
  was_minor?: Kobo;
  qty: number;
  format: ListingFormat;
  offers_enabled: boolean;
  auto_accept_minor?: Kobo;
  auto_decline_minor?: Kobo;
  location: Place;
  delivery: readonly DeliveryOption[];
  /** Days, or null for no returns (S2 step 6). */
  return_days: 3 | 7 | 14 | null;
  media: readonly ListingMedia[];
  attributes: readonly ListingAttribute[];
  status: ListingStatus;
  created_at: ISODateTime;
  /** Item rating, separate from seller feedback (audit F13). Absent = render nothing. */
  rating?: { average: number; count: number };
  /**
   * Social proof (spec §5.1 item 8). Optional on purpose: components render nothing
   * when a value is absent, so nothing is ever made up (PLAN F7).
   */
  sold_count?: number;
  watchers?: number;
  in_carts?: number;
};

/** A listing joined with what a card needs to render it. */
export type ListingWithSeller = Listing & { seller: SellerProfile; category: Category };
