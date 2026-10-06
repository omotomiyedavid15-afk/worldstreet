import { rules } from "@/config/marketplace-rules";
import type { DeliveryOption } from "@/lib/data/types";
import type { Kobo } from "@/lib/money";

/*
 * What the card's delivery line says, eBay style: "Free delivery in 2–4 days",
 * "+₦2,500 delivery in 1–2 days", "+₦3,000 pickup station", "Pickup only", or that the
 * seller doesn't deliver to the buyer's city, plus eBay's "Free local pickup" when a
 * meet-up is possible. Door delivery leads: a pickup station is cheaper but isn't
 * delivery, and a meet-up is never "free delivery".
 */

type Base = { pickup: boolean };
export type DeliverySummary =
  | (Base & { kind: "free"; option: DeliveryOption })
  | (Base & { kind: "paid"; option: DeliveryOption; fee_minor: Kobo })
  | (Base & { kind: "station"; option: DeliveryOption; fee_minor: Kobo })
  | { kind: "pickup" }
  | { kind: "none" };

const cheapest = (options: DeliveryOption[]) => options.reduce((best, o) => (o.fee_minor < best.fee_minor ? o : best));

/**
 * `sameCity` is whether the buyer's anchor is in the listing's city. Undefined (no
 * anchor yet) assumes it is, so the line shows the seller's cheapest option.
 */
export function summariseDelivery(options: readonly DeliveryOption[], sameCity?: boolean): DeliverySummary {
  const reachable = options.filter((o) => o.coverage === "nationwide" || sameCity !== false);
  const door = reachable.filter((o) => o.method === "rider" || o.method === "courier");
  const stations = reachable.filter((o) => o.method === "pickup_station");
  const pickup = sameCity !== false && options.some((o) => o.method === "meet_up");

  if (door.length > 0) {
    const best = cheapest(door);
    return best.fee_minor === 0 ? { kind: "free", option: best, pickup } : { kind: "paid", option: best, fee_minor: best.fee_minor, pickup };
  }
  if (stations.length > 0) {
    const best = cheapest(stations);
    return { kind: "station", option: best, fee_minor: best.fee_minor, pickup };
  }
  // Only meet-ups: the buyer travels, so it's pickup even from another city.
  if (options.some((o) => o.method === "meet_up")) return { kind: "pickup" };
  return { kind: "none" };
}

/** The delivery cost that goes into "Total to {city}", or null when there is no delivery. */
export function deliveryFee(summary: DeliverySummary): Kobo | null {
  if (summary.kind === "free") return summary.option.fee_minor;
  if (summary.kind === "paid" || summary.kind === "station") return summary.fee_minor;
  return null;
}

/** Business days from purchase to arrival: handling plus transit (eBay shows this on tiles). */
export function deliveryEstimate(option: DeliveryOption): readonly [number, number] {
  return [option.eta_days[0] + rules.delivery.typicalHandlingDays, option.eta_days[1] + rules.orders.handlingDays];
}
