import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { DeliveryLine, KeyFacts, PriceBlock, RatingStars, SellerMini, conditionLabel } from "@/features/listing-card/atoms";
import { BuyActions } from "@/features/listing-detail/BuyActions";
import { Gallery } from "@/features/listing-detail/Gallery";
import { DemandLine, ReassuranceLine } from "@/features/listing-detail/Lines";
import { StickyBuyBar } from "@/features/listing-detail/StickyBuyBar";
import { getAnchor } from "@/features/location/server";
import { RecordView } from "@/features/recent/RecordView";
import { listingPath, parseListingParam, repos } from "@/lib/data";
import { deliveryFee, summariseDelivery } from "@/lib/delivery";
import { formatCurrency } from "@/lib/money";
import { buyerTotal } from "@/lib/pricing";

/* SCR-004 Listing detail (flows B3, spec §7), eBay's layout: gallery left, the buy box
   right from 1024px (stacked below that), with the page's one h1 in the title block.
   Price, delivery to the buyer's area, returns and the escrow line sit above the fold on
   a 375×812 phone (§18 stage 3), and a sticky buy bar replaces the bottom nav there.
   Old or wrong slugs redirect to the canonical /listing/:id-:slug (R-011). */

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

  const goods = listing.category.kind === "goods";
  const summary = summariseDelivery(listing.delivery, anchor.city === listing.location.city);
  const fee = deliveryFee(summary);
  // One total for the buy box and the sticky bar (R-020).
  const total = goods && fee !== null && fee > 0 ? `Total to ${anchor.label} ${formatCurrency(buyerTotal({ item_minor: listing.price_minor, delivery_minor: fee }))}` : undefined;
  const price = `${formatCurrency(listing.price_minor)}${listing.price_period ? ` per ${listing.price_period}` : ""}`;
  const catHref = `/search?cat=${listing.category.id}`;

  return (
    <article className="ws-listing">
      <RecordView id={listing.id} />
      <nav aria-label="Breadcrumb" className="ws-crumbs">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href={catHref}>{listing.category.name}</Link>
          </li>
          <li aria-current="page">{listing.title}</li>
        </ol>
        <Link href={catHref} className="ws-crumbs__back">
          <ArrowLeftIcon />
          {listing.category.name}
        </Link>
      </nav>

      <div className="ws-listing__top">
        <Gallery listingId={listing.id} title={listing.title} media={listing.media} />

        <div className="ws-listing__side">
          <header className="ws-listing__title">
            <h1>{listing.title}</h1>
            {/* Condition leads the facts line, eBay style (no separate chip). */}
            <div className="ws-listing__facts">
              <KeyFacts listing={listing} />
              {listing.rating && <RatingStars value={listing.rating.average} count={listing.rating.count} />}
            </div>
          </header>

          <section className="ws-buybox" aria-label="Price and buying">
            <PriceBlock
              variant="detail"
              price_minor={listing.price_minor}
              was_minor={listing.was_minor}
              period={listing.price_period}
              bestOffer={listing.offers_enabled}
            />
            {goods && <DeliveryLine options={listing.delivery} price_minor={listing.price_minor} listingCity={listing.location.city} buyer={anchor} />}
            <ReassuranceLine listing={listing} />
            <div id="buybox-actions">
              <BuyActions
                listingId={listing.id}
                title={listing.title}
                price_minor={listing.price_minor}
                available={listing.qty}
                sold={listing.sold_count}
                kind={listing.category.kind}
                offers={listing.offers_enabled}
              />
            </div>
            <DemandLine listing={listing} />
            <div className="ws-buybox__seller">
              <SellerMini seller={listing.seller} link avatar />
            </div>
          </section>
        </div>
      </div>

      <StickyBuyBar
        watch="buybox-actions"
        listingId={listing.id}
        title={listing.title}
        price={price}
        price_minor={listing.price_minor}
        total={total}
        action={goods ? { label: "Buy it now", href: `/checkout?listing=${listing.id}` } : { label: "Contact seller", href: `/inbox?listing=${listing.id}` }}
      />
    </article>
  );
}
