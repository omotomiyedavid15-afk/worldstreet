/* STORY DATA ONLY: fictional listings for Storybook and tests. features/ may not import
   mocks/ (PLAN §2.2), so the few cards stories need are spelled out here. */

import type { Category, DeliveryOption, ListingWithSeller, Place, SellerProfile } from "@/lib/data/types";
import { toMinor } from "@/lib/money";
import type { Anchor } from "./ListingCard";

export const STORY_NOW = Date.parse("2026-10-06T09:00:00Z");
const ago = (days: number) => new Date(STORY_NOW - days * 86_400_000).toISOString();

const place = (area: string, city: string, state: string, lat: number, lng: number): Place => ({ area, city, state, lat, lng });
const ikeja = place("Ikeja GRA", "Lagos", "Lagos", 6.5833, 3.3557);
const yaba = place("Yaba", "Lagos", "Lagos", 6.5095, 3.3711);
const lekki = place("Lekki Phase 1", "Lagos", "Lagos", 6.4474, 3.4723);
const ajah = place("Ajah", "Lagos", "Lagos", 6.4672, 3.5717);
const wuse = place("Wuse 2", "Abuja", "FCT", 9.0801, 7.4694);

/** A buyer in Lekki. */
export const lekkiAnchor: Anchor = { id: "lekki", label: "Lekki", city: lekki.city, lat: lekki.lat, lng: lekki.lng };

const opt = (method: DeliveryOption["method"], naira: number, coverage: DeliveryOption["coverage"]): DeliveryOption => ({
  method,
  fee_minor: toMinor(naira),
  eta_days: [1, 3],
  coverage,
});
const lagosDelivery = [opt("rider", 2_500, "same_city"), opt("meet_up", 0, "same_city"), opt("courier", 4_500, "nationwide")];

const seller = (id: string, shop_name: string, area: Place, extra: Partial<SellerProfile>): SellerProfile => ({
  id,
  handle: shop_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  shop_name,
  area,
  level: "standard",
  verified: true,
  top_rated: false,
  feedback: { positive_percent: 98, count: 200 },
  joined_at: "2023-01-01T00:00:00Z",
  show_watchers: false,
  ...extra,
});
const gadgetHub = seller("s1", "Gadget Hub Ikeja", ikeja, { level: "trusted", top_rated: true, feedback: { positive_percent: 99.2, count: 1284 }, show_watchers: true });
const yabaTech = seller("s2", "Yaba Tech Deals", yaba, { feedback: { positive_percent: 97.5, count: 412 } });
const adire = seller("s3", "Adire & Co", lekki, { level: "trusted", top_rated: true, feedback: { positive_percent: 99.8, count: 2031 }, show_watchers: true });
const tunde = seller("s4", "Tunde's Corner", ajah, { level: "new", verified: false, feedback: { positive_percent: 100, count: 4 } });
const wuseElec = seller("s5", "Wuse Electronics", wuse, { level: "trusted", top_rated: true, feedback: { positive_percent: 98.9, count: 876 } });

const category = (id: Category["id"], name: string, inspection: Category["inspection"]): Category => ({ id, name, inspection, kind: "goods" });
const electronics = category("electronics", "Electronics", "electronics");
const phones = category("phones", "Phones & tablets", "phones");
const fashion = category("fashion", "Fashion", "fashion");

const photos = (title: string, cat: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({
    url: `/mock/img/${cat}.svg`,
    alt: i === 0 ? title : `${title}, photo ${i + 1}`,
    order: i,
    type: "image" as const,
    width: 800,
    height: 800,
  }));

type Seed = Omit<ListingWithSeller, "slug" | "description" | "media" | "attributes" | "status" | "seller_id" | "category_id" | "return_days"> & { photoCount?: number };

function listing({ photoCount = 4, ...l }: Seed): ListingWithSeller {
  return {
    ...l,
    slug: l.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: `${l.title}. Story data, not a real item.`,
    media: photos(l.title, l.category.id, photoCount),
    attributes: [],
    status: "live",
    seller_id: l.seller.id,
    category_id: l.category.id,
    return_days: 7,
  };
}

export const storyListings: ListingWithSeller[] = [
  listing({
    id: "204507", title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", category: electronics, seller: gadgetHub,
    condition: "new", price_minor: toMinor(485_000), was_minor: toMinor(560_000), qty: 12, format: "buy_now", offers_enabled: false,
    location: ikeja, delivery: [opt("courier", 0, "nationwide")], created_at: ago(2), rating: { average: 4.9, count: 52 },
    sold_count: 38, watchers: 31, in_carts: 6, photoCount: 6,
  }),
  listing({
    id: "204501", title: "iPhone 14 Pro 256GB Deep Purple", category: phones, seller: gadgetHub,
    condition: "used", price_minor: toMinor(845_000), was_minor: toMinor(920_000), qty: 1, format: "best_offer", offers_enabled: true,
    location: ikeja, delivery: lagosDelivery, created_at: ago(3), rating: { average: 4.8, count: 36 }, sold_count: 64, watchers: 22, photoCount: 8,
  }),
  listing({
    id: "204519", title: "Hand-dyed Adire Kaftan, Indigo (Men's L)", category: fashion, seller: adire,
    condition: "new", price_minor: toMinor(45_000), qty: 30, format: "buy_now", offers_enabled: false,
    location: lekki, delivery: lagosDelivery, created_at: ago(1), rating: { average: 4.9, count: 88 }, sold_count: 210, photoCount: 5,
  }),
  listing({
    id: "204504", title: "Infinix Hot 40i 128GB", category: phones, seller: tunde,
    condition: "like_new", price_minor: toMinor(132_000), qty: 1, format: "best_offer", offers_enabled: true,
    location: ajah, delivery: [opt("meet_up", 0, "same_city")], created_at: ago(5), photoCount: 3,
  }),
  listing({
    id: "204508", title: "JBL Tune 520BT On-Ear Headphones", category: electronics, seller: yabaTech,
    condition: "new", price_minor: toMinor(58_000), qty: 3, format: "buy_now", offers_enabled: false,
    location: yaba, delivery: lagosDelivery, created_at: ago(4), sold_count: 47, photoCount: 1,
  }),
  listing({
    id: "204502", title: "Samsung Galaxy S23 Ultra 512GB", category: phones, seller: wuseElec,
    condition: "refurbished", price_minor: toMinor(910_000), qty: 4, format: "buy_now", offers_enabled: false,
    location: wuse, delivery: [opt("courier", 4_500, "nationwide"), opt("pickup_station", 3_000, "nationwide")], created_at: ago(9),
    rating: { average: 4.6, count: 18 }, sold_count: 21, photoCount: 6,
  }),
];
