import type { ReactNode } from "react";
import { DeliveryTruckIcon, LocationIcon } from "@/components/icons";
import { rules } from "@/config/marketplace-rules";
import type { DeliveryOption, Listing, Place } from "@/lib/data/types";
import { deliveryFee, summariseDelivery } from "@/lib/delivery";
import { formatDistance, plural, timeAgo } from "@/lib/format";
import { formatCurrency, type Kobo } from "@/lib/money";
import { buyerTotal } from "@/lib/pricing";

/* The card's meta lines (spec §5.1 items 6–8): DeliveryLine, LocationLine and
   SocialProof. Wording follows eBay ("Free delivery", "+₦2,500 delivery", "64 sold",
   "Last one"); each line says nothing rather than something it can't back up. */

/**
 * Items separated by "·". Each item carries its own leading dot and the list is pulled
 * left inside a clipping box, so the dot on whichever item starts a line is cut off:
 * a wrap never leaves a dot dangling at either end.
 */
function MetaList({ items }: { items: ReactNode[] }) {
  return (
    <span className="ws-meta__clip">
      <span className="ws-meta__list">
        {items.map((item, i) => (
          <span key={i} className="ws-meta__item">
            {item}
          </span>
        ))}
      </span>
    </span>
  );
}

type DeliveryLineProps = {
  options: readonly DeliveryOption[];
  price_minor: Kobo;
  listingCity: string;
  /** The buyer's anchor. `label` is what the location bar shows ("Lekki"). */
  buyer?: { city: string; label: string };
};

export function DeliveryLine({ options, price_minor, listingCity, buyer }: DeliveryLineProps) {
  const summary = summariseDelivery(options, buyer ? buyer.city === listingCity : undefined);
  const fee = deliveryFee(summary);

  let text: ReactNode;
  if (summary.kind === "free") text = <span className="ws-delivery__free">Free delivery</span>;
  else if (summary.kind === "paid") text = <span className="ws-delivery__fee">{formatCurrency(summary.fee_minor, { signed: true })} delivery</span>;
  else if (summary.kind === "pickup") text = <span className="ws-delivery__fee">Pickup only</span>;
  else text = <span>{buyer ? `Doesn't deliver to ${buyer.city}` : "No delivery options"}</span>;

  const Icon = summary.kind === "pickup" ? LocationIcon : DeliveryTruckIcon;
  return (
    <div className="ws-delivery">
      <p className="ws-meta">
        <Icon />
        {text}
      </p>
      {buyer && fee !== null && (
        <p className="ws-meta ws-delivery__total">
          Total to {buyer.label} <strong>{formatCurrency(buyerTotal({ item_minor: price_minor, delivery_minor: fee }))}</strong>
        </p>
      )}
    </div>
  );
}

type LocationLineProps = {
  place: Place;
  /** From the buyer's anchor; omit when there's no anchor. */
  distanceKm?: number;
  postedAt?: string;
  now?: number;
};

/** "Ikeja GRA · 4.2 km away · 3d ago". Far or unanchored items also name the city. */
export function LocationLine({ place, distanceKm, postedAt, now }: LocationLineProps) {
  const far = distanceKm === undefined || distanceKm > 50;
  const parts: ReactNode[] = [<span key="area">{far ? `${place.area}, ${place.city}` : place.area}</span>];
  if (distanceKm !== undefined) parts.push(<span key="km">{formatDistance(distanceKm)} away</span>);
  if (postedAt) {
    const ago = timeAgo(postedAt, now);
    parts.push(
      <time key="ago" dateTime={postedAt}>
        <span aria-hidden="true">{ago.short}</span>
        <span className="cx-sr-only">Listed {ago.long}</span>
      </time>,
    );
  }
  return (
    <p className="ws-meta">
      <LocationIcon />
      <MetaList items={parts} />
    </p>
  );
}

type Signal = { text: string; urgent?: boolean };

/**
 * eBay's signals, most useful first, at most `max` (spec §5.3: two). Watchers stay
 * private unless the seller shows them and there are more than the threshold (R-025).
 */
export function socialSignals(
  listing: Pick<Listing, "qty" | "sold_count" | "watchers" | "in_carts">,
  { showWatchers = false, max = 2 }: { showWatchers?: boolean; max?: number } = {},
): Signal[] {
  const signals: Signal[] = [];
  const sold = listing.sold_count ?? 0;
  if (sold > 0 && listing.qty === 1) signals.push({ text: "Last one", urgent: true });
  else if (sold > 0 && listing.qty > 1 && listing.qty <= 3) signals.push({ text: "Almost gone", urgent: true });
  if (sold > 0) signals.push({ text: plural(sold, "sold", "sold") });
  if (showWatchers && (listing.watchers ?? 0) > rules.demand.watchersThreshold) signals.push({ text: plural(listing.watchers!, "watcher") });
  if ((listing.in_carts ?? 0) > 0) signals.push({ text: `In ${plural(listing.in_carts!, "cart")}` });
  return signals.slice(0, max);
}

export function SocialProof({ listing, showWatchers }: { listing: Pick<Listing, "qty" | "sold_count" | "watchers" | "in_carts">; showWatchers?: boolean }) {
  const signals = socialSignals(listing, { showWatchers });
  if (signals.length === 0) return null;
  return (
    <p className="ws-meta">
      <MetaList
        items={signals.map((s) => (
          <span key={s.text} className={s.urgent ? "ws-proof__urgent" : "ws-proof__strong"}>
            {s.text}
          </span>
        ))}
      />
    </p>
  );
}
