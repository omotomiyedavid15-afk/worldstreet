/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by lib/data/index.ts. */

import type { SellerProfile } from "@/lib/data/types";
import { places } from "./places";

export const sellers: readonly SellerProfile[] = [
  {
    id: "s01", handle: "gadgethub-ikeja", shop_name: "Gadget Hub Ikeja", area: places.ikeja, level: "trusted",
    verified: true, top_rated: true, feedback: { positive_percent: 99.2, count: 1_284 }, reply_hours: 1,
    joined_at: "2022-03-14T09:00:00Z", show_watchers: true,
  },
  {
    id: "s02", handle: "yaba-tech-deals", shop_name: "Yaba Tech Deals", area: places.yaba, level: "standard",
    verified: true, top_rated: false, feedback: { positive_percent: 97.5, count: 412 }, reply_hours: 3,
    joined_at: "2023-07-02T09:00:00Z", show_watchers: false,
  },
  {
    id: "s03", handle: "adire-and-co", shop_name: "Adire & Co", area: places.lekki, level: "trusted",
    verified: true, top_rated: true, feedback: { positive_percent: 99.8, count: 2_031 }, reply_hours: 2,
    joined_at: "2021-11-20T09:00:00Z", show_watchers: true,
  },
  {
    id: "s04", handle: "homeplus-surulere", shop_name: "HomePlus Surulere", area: places.surulere, level: "standard",
    verified: true, top_rated: false, feedback: { positive_percent: 96.1, count: 238 }, reply_hours: 5,
    joined_at: "2024-01-09T09:00:00Z", show_watchers: false,
  },
  {
    id: "s05", handle: "tunde-sells", shop_name: "Tunde's Corner", area: places.ajah, level: "new",
    verified: false, top_rated: false, feedback: { positive_percent: 100, count: 4 },
    joined_at: "2026-08-28T09:00:00Z", show_watchers: false,
  },
  {
    id: "s06", handle: "wuse-electronics", shop_name: "Wuse Electronics", area: places.wuse, level: "trusted",
    verified: true, top_rated: true, feedback: { positive_percent: 98.9, count: 876 }, reply_hours: 2,
    joined_at: "2022-06-30T09:00:00Z", show_watchers: true,
  },
  {
    id: "s07", handle: "glow-by-amaka", shop_name: "Glow by Amaka", area: places.vi, level: "standard",
    verified: true, top_rated: false, feedback: { positive_percent: 98.4, count: 167 }, reply_hours: 4,
    joined_at: "2024-05-17T09:00:00Z", show_watchers: false,
  },
  {
    id: "s08", handle: "oyo-furnish", shop_name: "Oyo Furnish", area: places.bodija, level: "standard",
    verified: true, top_rated: false, feedback: { positive_percent: 95.7, count: 93 }, reply_hours: 6,
    joined_at: "2024-10-03T09:00:00Z", show_watchers: false,
  },
  {
    id: "s09", handle: "garden-city-motors", shop_name: "Garden City Motors", area: places.gra_ph, level: "trusted",
    verified: true, top_rated: false, feedback: { positive_percent: 97.9, count: 141 }, reply_hours: 3,
    joined_at: "2023-02-11T09:00:00Z", show_watchers: false,
  },
  {
    id: "s10", handle: "ikoyi-homes", shop_name: "Ikoyi Homes", area: places.ikoyi, level: "standard",
    verified: true, top_rated: false, feedback: { positive_percent: 96.8, count: 58 }, reply_hours: 8,
    joined_at: "2025-03-22T09:00:00Z", show_watchers: false,
  },
];
