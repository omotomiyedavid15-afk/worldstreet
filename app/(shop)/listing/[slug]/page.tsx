import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CheckShieldIcon, InfoCircleIcon } from "@/components/icons";
import { Card } from "@/components/ui";
import { ConditionChip, DeliveryLine, PriceBlock, SaveButton, SellerMini, conditionLabel } from "@/features/listing-card/atoms";
import { getAnchor } from "@/features/location/server";
import { escrowLine } from "@/lib/copy/escrow";
import { listingPath, parseListingParam, repos } from "@/lib/data";
import { formatCurrency } from "@/lib/money";

/* SCR-004 placeholder. Cards link here, so it shows the essentials now; the full page
   (gallery, buy box, panels, reviews) is Phase 3. Old or wrong slugs redirect to the
   canonical /listing/:id-:slug (R-011). */

async function load(slug: string) {
  const parsed = parseListingParam(slug);
  return parsed ? { parsed, listing: await repos.listings.get(parsed.id) } : null;
}

/* Link previews (blueprint F16): listings get shared on WhatsApp, so the preview says
   price, condition and area. Never a phone number or an address. */
export async function generateMetadata({ params }: PageProps<"/listing/[slug]">): Promise<Metadata> {
  const listing = (await load((await params).slug))?.listing;
  if (!listing) return { title: "Listing not found", robots: { index: false } };
  const price = `${formatCurrency(listing.price_minor)}${listing.price_period ? ` per ${listing.price_period}` : ""}`;
  const description = [price, listing.category.kind === "property" ? null : conditionLabel(listing.condition), `${listing.location.area}, ${listing.location.city}`]
    .filter(Boolean)
    .join(" · ");
  const url = listingPath(listing);
  return {
    title: listing.title,
    description,
    alternates: { canonical: url },
    openGraph: { title: listing.title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title: listing.title, description },
  };
}

export default async function ListingPage({ params }: PageProps<"/listing/[slug]">) {
  const found = await load((await params).slug);
  if (!found?.listing) notFound();
  const { listing, parsed } = found;
  if (parsed.slug !== listing.slug) permanentRedirect(listingPath(listing));
  const { anchor } = await getAnchor();
  const photo = listing.media[0];

  return (
    <article className="ws-listing-stub">
      <div className="ws-listing-stub__media">
        {photo && <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 768px) 480px, 100vw" priority />}
        <div className="ws-card__save">
          <SaveButton listingId={listing.id} title={listing.title} />
        </div>
      </div>
      <div className="ws-listing-stub__body">
        {listing.category.kind !== "property" && <ConditionChip condition={listing.condition} />}
        <h1 className="ws-listing-stub__title">{listing.title}</h1>
        <PriceBlock variant="detail" price_minor={listing.price_minor} was_minor={listing.was_minor} period={listing.price_period} bestOffer={listing.offers_enabled} />
        {listing.category.kind !== "property" && (
          <DeliveryLine options={listing.delivery} price_minor={listing.price_minor} listingCity={listing.location.city} buyer={anchor} />
        )}
        {/* The start of the Phase 3 ProtectionPanel; wording from the one escrow source. */}
        <p className="ws-listing-stub__escrow" data-covered={listing.category.kind === "goods" || undefined}>
          {listing.category.kind === "goods" ? <CheckShieldIcon /> : <InfoCircleIcon />}
          {escrowLine(listing.category)}
        </p>
        <SellerMini seller={listing.seller} />
        <Card className="ws-listing-stub__note">
          <p>
            <InfoCircleIcon />
            The full listing page, with photos, buying options and seller details, arrives in Phase 3.
          </p>
          <Link href="/search">Back to search</Link>
        </Card>
      </div>
    </article>
  );
}
