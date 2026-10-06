import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "@/components/icons";
import { Card, Skeleton } from "@/components/ui";
import { listingPath } from "@/lib/data/repo";
import type { ListingWithSeller } from "@/lib/data/types";
import { haversineKm, type LatLng } from "@/lib/geo";
import { plural } from "@/lib/format";
import { ConditionChip, DeliveryLine, LocationLine, PriceBlock, RatingStars, SaveButton, SellerMini, SocialProof } from "./atoms";

/* ListingCard, grid variant (spec §5.1–5.2), in eBay's order: photo with the heart,
   condition, title, rating, price, delivery and total, location, demand, seller.
   The photo fills the card edge to edge at a fixed 1:1 ratio (no layout shift). The
   title is the card's one link, stretched over the whole card (spec §16.6); Save sits
   above it as its own button. */

/** The buyer's location anchor (R-001): `label` is what the location bar shows. */
export type Anchor = LatLng & { city: string; label: string };

type Props = {
  listing: ListingWithSeller;
  anchor?: Anchor;
  /** Grid columns change with the viewport (spec §5.2); keeps srcset honest. */
  sizes?: string;
  /** Above-the-fold cards load their photo eagerly (LCP). */
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  now?: number;
};

const GRID_SIZES = "(min-width: 1200px) 20vw, (min-width: 768px) 33vw, 50vw";

export function ListingCard({ listing, anchor, sizes = GRID_SIZES, priority, headingLevel: H = "h3", now }: Props) {
  const photo = listing.media[0];
  const distanceKm = anchor ? haversineKm(anchor, listing.location) : undefined;

  return (
    <Card as="article" interactive className="ws-card">
      <div className="ws-card__media">
        {photo && <Image src={photo.url} alt={photo.alt} fill sizes={sizes} priority={priority} />}
        <div className="ws-card__save">
          <SaveButton listingId={listing.id} title={listing.title} />
        </div>
        {listing.media.length > 1 && (
          <span className="ws-card__photos">
            <ImageIcon />
            <span aria-hidden="true">{listing.media.length}</span>
            <span className="cx-sr-only">{plural(listing.media.length, "photo")}</span>
          </span>
        )}
      </div>

      <div className="ws-card__body">
        <div className="ws-card__head">
          <div className="ws-card__chips">
            <ConditionChip condition={listing.condition} />
          </div>
          <H className="ws-card__title">
            <Link href={listingPath(listing)} className="ws-card__link">
              {listing.title}
            </Link>
          </H>
          <div className="ws-card__rating">{listing.rating && <RatingStars value={listing.rating.average} count={listing.rating.count} />}</div>
        </div>

        <PriceBlock price_minor={listing.price_minor} was_minor={listing.was_minor} bestOffer={listing.offers_enabled} />

        <div className="ws-card__meta">
          <DeliveryLine
            options={listing.delivery}
            price_minor={listing.price_minor}
            listingCity={listing.location.city}
            buyer={anchor && { city: anchor.city, label: anchor.label }}
          />
          <LocationLine place={listing.location} distanceKm={distanceKm} postedAt={listing.created_at} now={now} />
          <SocialProof listing={listing} showWatchers={listing.seller.show_watchers} />
        </div>

        <div className="ws-card__seller">
          <SellerMini seller={listing.seller} />
        </div>
      </div>
    </Card>
  );
}

/** Same box as the card, so swapping it in causes no layout shift (spec §5.2). */
export function ListingCardSkeleton() {
  return (
    <Card as="div" className="ws-card ws-card--skeleton">
      <div className="ws-card__media">
        <Skeleton width="100%" height="100%" radius={0} />
      </div>
      <div className="ws-card__body">
        <div className="ws-card__head">
          <Skeleton width={84} height={26} radius="var(--cx-r-pill)" />
          <Skeleton width="92%" height={16} />
          <Skeleton width="64%" height={16} />
          <div className="ws-card__rating">
            <Skeleton width={96} height={14} />
          </div>
        </div>
        <Skeleton width="48%" height={24} />
        <div className="ws-card__meta">
          <Skeleton width="72%" height={14} />
          <Skeleton width="58%" height={14} />
        </div>
        <div className="ws-card__seller">
          <Skeleton width="80%" height={14} />
        </div>
      </div>
    </Card>
  );
}
