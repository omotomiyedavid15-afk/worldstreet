import type { DeliveryOption } from "@/lib/data/types";
import type { Kobo } from "@/lib/money";

/*
 * What the card's delivery line says, eBay style: "Free delivery", "+₦2,500 delivery",
 * "Pickup only", or that the seller doesn't deliver to the buyer's city. Meet-ups are
 * pickup, not delivery, so they never make an item "free delivery".
 */

export type DeliverySummary =
  | { kind: "free"; option: DeliveryOption }
  | { kind: "paid"; option: DeliveryOption; fee_minor: Kobo }
  | { kind: "pickup" }
  | { kind: "none" };

/**
 * `sameCity` is whether the buyer's anchor is in the listing's city. Undefined (no
 * anchor yet) assumes it is, so the line shows the seller's cheapest option.
 */
export function summariseDelivery(options: readonly DeliveryOption[], sameCity?: boolean): DeliverySummary {
  const reachable = options.filter((o) => o.coverage === "nationwide" || sameCity !== false);
  const shipping = reachable.filter((o) => o.method !== "meet_up");
  if (shipping.length > 0) {
    const cheapest = shipping.reduce((best, o) => (o.fee_minor < best.fee_minor ? o : best));
    return cheapest.fee_minor === 0 ? { kind: "free", option: cheapest } : { kind: "paid", option: cheapest, fee_minor: cheapest.fee_minor };
  }
  // Only meet-ups: the buyer travels, so it's pickup even from another city.
  if (options.some((o) => o.method === "meet_up")) return { kind: "pickup" };
  return { kind: "none" };
}

/** The delivery cost that goes into "Total to {city}", or null when there is no delivery. */
export function deliveryFee(summary: DeliverySummary): Kobo | null {
  if (summary.kind === "free") return summary.option.fee_minor;
  if (summary.kind === "paid") return summary.fee_minor;
  return null;
}
