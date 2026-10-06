import { rules } from "@/config/marketplace-rules";
import type { Listing } from "@/lib/data/types";
import { haversineKm, type LatLng } from "@/lib/geo";

/*
 * Location radius (R-001, R-016, flows B2): never show an item outside the radius
 * unless the buyer chose Nationwide. `null` is Nationwide; in the URL it's "all".
 */

export type Radius = (typeof rules.location.radiiKm)[number] | null;

export const RADII: readonly Radius[] = [...rules.location.radiiKm, null];

export function parseRadius(value: string | string[] | undefined): Radius {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "all") return null;
  const n = Number(v);
  return (rules.location.radiiKm as readonly number[]).includes(n) ? (n as Radius) : rules.location.defaultRadiusKm;
}

export function radiusParam(radius: Radius) {
  return radius === null ? "all" : String(radius);
}

export function radiusLabel(radius: Radius) {
  return radius === null ? "Nationwide" : `${radius} km`;
}

export function filterByRadius<T extends Pick<Listing, "location">>(listings: readonly T[], anchor: LatLng, radius: Radius): T[] {
  if (radius === null) return [...listings];
  return listings.filter((l) => haversineKm(anchor, l.location) <= radius);
}

/** How many listings each radius would show, for "12 results within 25 km" (B2). */
export function countsByRadius(listings: readonly Pick<Listing, "location">[], anchor: LatLng): Map<Radius, number> {
  const km = listings.map((l) => haversineKm(anchor, l.location));
  return new Map(RADII.map((r) => [r, r === null ? km.length : km.filter((d) => d <= r).length]));
}
