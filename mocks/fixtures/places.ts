/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by lib/data/index.ts. */

import type { Place } from "@/lib/data/types";

/** Area centroids (approximate), never street addresses (PLAN F8). */
export const places = {
  ikeja: { area: "Ikeja GRA", city: "Lagos", state: "Lagos", lat: 6.5833, lng: 3.3557 },
  yaba: { area: "Yaba", city: "Lagos", state: "Lagos", lat: 6.5095, lng: 3.3711 },
  surulere: { area: "Surulere", city: "Lagos", state: "Lagos", lat: 6.4969, lng: 3.3539 },
  vi: { area: "Victoria Island", city: "Lagos", state: "Lagos", lat: 6.4281, lng: 3.4219 },
  ikoyi: { area: "Ikoyi", city: "Lagos", state: "Lagos", lat: 6.4521, lng: 3.4352 },
  lekki: { area: "Lekki Phase 1", city: "Lagos", state: "Lagos", lat: 6.4474, lng: 3.4723 },
  ajah: { area: "Ajah", city: "Lagos", state: "Lagos", lat: 6.4672, lng: 3.5717 },
  festac: { area: "Festac Town", city: "Lagos", state: "Lagos", lat: 6.4664, lng: 3.2836 },
  ikorodu: { area: "Ikorodu", city: "Lagos", state: "Lagos", lat: 6.6194, lng: 3.5105 },
  wuse: { area: "Wuse 2", city: "Abuja", state: "FCT", lat: 9.0801, lng: 7.4694 },
  garki: { area: "Garki", city: "Abuja", state: "FCT", lat: 9.0333, lng: 7.4917 },
  bodija: { area: "Bodija", city: "Ibadan", state: "Oyo", lat: 7.4352, lng: 3.9133 },
  gra_ph: { area: "Old GRA", city: "Port Harcourt", state: "Rivers", lat: 4.7924, lng: 7.0083 },
} as const satisfies Record<string, Place>;

export type PlaceKey = keyof typeof places;
