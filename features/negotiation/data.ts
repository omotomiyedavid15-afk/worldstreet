import { repos } from "@/lib/data";
import type { DealListing } from "./NegotiationHub";
/** Only the listing context needed by the local negotiation adapter crosses the boundary. */
export async function dealListings(): Promise<DealListing[]> {
  return (await repos.listings.list({ status: ["live", "reserved", "sold", "paused", "ended"] })).map((l) => ({ id: l.id, seller_id: l.seller_id, price_minor: l.price_minor, qty: l.qty, status: l.status, category_id: l.category_id, title: l.title, slug: l.slug, shop_name: l.seller.shop_name }));
}
