import { BUYER_VISIBLE, type Repos } from "./repo";
import type { Category, Listing, ListingWithSeller, Review, SellerProfile } from "./types";

export type Dataset = {
  categories: readonly Category[];
  sellers: readonly SellerProfile[];
  listings: readonly Listing[];
  reviews?: readonly Review[];
  trending?: readonly string[];
};

/**
 * In-memory adapter over a fixed dataset. Throws on construction if a listing points
 * at a seller or category that doesn't exist, so broken fixtures fail fast.
 */
export function createMemoryRepos(data: Dataset): Repos {
  const categories = new Map(data.categories.map((c) => [c.id, c]));
  const sellers = new Map(data.sellers.map((s) => [s.id, s]));

  const joined = new Map<string, ListingWithSeller>();
  for (const listing of data.listings) {
    const seller = sellers.get(listing.seller_id);
    const category = categories.get(listing.category_id);
    if (!seller) throw new Error(`Listing ${listing.id}: unknown seller ${listing.seller_id}`);
    if (!category) throw new Error(`Listing ${listing.id}: unknown category ${listing.category_id}`);
    if (joined.has(listing.id)) throw new Error(`Duplicate listing id ${listing.id}`);
    joined.set(listing.id, { ...listing, seller, category });
  }

  const newestFirst = (a: Review, b: Review) => b.created_at.localeCompare(a.created_at);
  const reviews = [...(data.reviews ?? [])].sort(newestFirst);
  for (const r of reviews) {
    if (!joined.has(r.listing_id)) throw new Error(`Review ${r.id}: unknown listing ${r.listing_id}`);
    if (joined.get(r.listing_id)!.seller_id !== r.seller_id) throw new Error(`Review ${r.id}: seller doesn't match its listing`);
  }

  return {
    listings: {
      async get(id) {
        return joined.get(id) ?? null;
      },
      async list(filter = {}) {
        const statuses = new Set(filter.status ?? BUYER_VISIBLE);
        const ids = filter.ids && new Set(filter.ids);
        return [...joined.values()].filter(
          (l) =>
            statuses.has(l.status) &&
            (!ids || ids.has(l.id)) &&
            (!filter.category_id || l.category_id === filter.category_id) &&
            (!filter.seller_id || l.seller_id === filter.seller_id),
        );
      },
    },
    sellers: {
      async get(id) {
        return sellers.get(id) ?? null;
      },
      async getByHandle(handle) {
        const wanted = handle.toLowerCase();
        return data.sellers.find((s) => s.handle.toLowerCase() === wanted) ?? null;
      },
      async list() {
        return [...data.sellers];
      },
    },
    categories: {
      async get(id) {
        return categories.get(id) ?? null;
      },
      async list() {
        return [...data.categories];
      },
    },
    reviews: {
      async forListing(listingId) {
        return reviews.filter((r) => r.listing_id === listingId);
      },
      async forSeller(sellerId) {
        return reviews.filter((r) => r.seller_id === sellerId);
      },
    },
    search: {
      async trending() {
        return [...(data.trending ?? [])];
      },
    },
  };
}
