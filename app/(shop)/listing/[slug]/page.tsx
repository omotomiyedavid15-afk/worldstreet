import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { InfoCircleIcon } from "@/components/icons";
import { Card } from "@/components/ui";
import { ConditionChip, DeliveryLine, PriceBlock, SaveButton, SellerMini } from "@/features/listing-card/atoms";
import { getAnchor } from "@/features/location/server";
import { listingPath, parseListingParam, repos } from "@/lib/data";

/* SCR-004 placeholder. Cards link here, so it shows the essentials now; the full page
   (gallery, buy box, panels, reviews) is Phase 3. Old or wrong slugs redirect to the
   canonical /listing/:id-:slug (R-011). */

async function load(slug: string) {
  const parsed = parseListingParam(slug);
  return parsed ? { parsed, listing: await repos.listings.get(parsed.id) } : null;
}

export async function generateMetadata({ params }: PageProps<"/listing/[slug]">): Promise<Metadata> {
  const found = await load((await params).slug);
  return { title: found?.listing?.title ?? "Listing not found" };
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
        <ConditionChip condition={listing.condition} />
        <h1 className="ws-listing-stub__title">{listing.title}</h1>
        <PriceBlock variant="detail" price_minor={listing.price_minor} was_minor={listing.was_minor} bestOffer={listing.offers_enabled} />
        <DeliveryLine options={listing.delivery} price_minor={listing.price_minor} listingCity={listing.location.city} buyer={anchor} />
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
