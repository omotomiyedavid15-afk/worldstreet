import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClass } from "@/components/ui";
import { rules } from "@/config/marketplace-rules";
import { ListingCard } from "@/features/listing-card/ListingCard";
import { setLocation } from "@/features/location/actions";
import { LocationBar } from "@/features/location/LocationBar";
import { getAnchor } from "@/features/location/server";
import { GlobalSearchBox } from "@/features/search/GlobalSearchBox";
import { ActiveFilterChips, ProhibitedResults, ResultsHeader, ZeroResults } from "@/features/search/Results";
import { SortMenu } from "@/features/search/SortMenu";
import { listingPath, repos } from "@/lib/data";
import { parseFilters } from "@/lib/search/filters";
import { first, hrefWith, type SearchParams } from "@/lib/search/params";
import { parseQuery, type ParsedQuery } from "@/lib/search/query";
import { parseRadius, radiusParam } from "@/lib/search/radius";
import { parsePage, runSearch } from "@/lib/search/run";
import { parseSort } from "@/lib/search/sort";

/* SCR-003 Search results (flows B2). Everything is in the URL (R-011):
   ?q=&cat=&min=&max=&sort=&radius=&page=. The page renders on the server from those
   and the buyer's area, so Back and shared links show exactly the same results. */

const PATH = "/search";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = first((await searchParams).q)?.trim();
  return {
    title: q ? `${q} for sale near you` : "Search",
    // Result pages change constantly; category landing pages are what get indexed.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params: SearchParams = await searchParams;
  const parsed = parseQuery(first(params.q));

  // EC-002: a listing id or link goes straight to the listing.
  if (parsed.kind === "listing-id") {
    const listing = await repos.listings.get(parsed.id);
    if (listing) redirect(listingPath(listing));
  }

  const [{ anchor, inferred }, categories, listings, trending] = await Promise.all([
    getAnchor(),
    repos.categories.list(),
    repos.listings.list(),
    repos.search.trending(),
  ]);
  const radius = parseRadius(params.radius);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);
  const filters = parseFilters(params, categories.map((c) => c.id));
  // An id that matches no listing is searched as text, so it simply finds nothing.
  const query: ParsedQuery = parsed.kind === "listing-id" ? { kind: "text", raw: parsed.raw, tokens: [parsed.id] } : parsed;
  const returnTo = hrefWith(PATH, params, "page", null);
  const keep: Record<string, string> = radius === rules.location.defaultRadiusKm ? {} : { radius: radiusParam(radius) };

  const box = <GlobalSearchBox key={parsed.raw} defaultValue={parsed.raw} trending={trending} keep={keep} />;
  const bar = <LocationBar anchor={anchor} inferred={inferred} radius={radius} returnTo={returnTo} action={setLocation} />;

  if (query.kind === "prohibited") {
    return (
      <div className="ws-search-page">
        {box}
        <ResultsHeader query={parsed.raw} total={0} shown={0} sortMenu={null} />
        <ProhibitedResults />
      </div>
    );
  }

  const result = runSearch({
    listings,
    query,
    filters,
    anchor,
    radius,
    sort,
    page,
  });

  return (
    <div className="ws-search-page">
      {box}
      {bar}
      <ResultsHeader
        query={parsed.raw}
        total={result.total}
        shown={result.shown.length}
        sortMenu={<SortMenu current={sort} pathname={PATH} params={params} />}
      />
      <ActiveFilterChips filters={filters} categories={categories} pathname={PATH} params={params} />

      {result.total === 0 ? (
        <ZeroResults
          query={parsed.raw}
          anchor={anchor}
          radius={radius}
          radiusCounts={result.radiusCounts}
          filterCounts={result.filterCounts}
          filters={filters}
          categories={categories}
          pathname={PATH}
          params={params}
        />
      ) : (
        <>
          <ul className="ws-card-grid ws-results" aria-label="Listings">
            {result.shown.map((l, i) => (
              <li key={l.id}>
                <ListingCard listing={l} anchor={anchor} headingLevel="h2" priority={i < 4} />
              </li>
            ))}
          </ul>
          {result.shown.length < result.total && (
            <div className="ws-results-more">
              <Link href={hrefWith(PATH, params, "page", String(page + 1))} scroll={false} className={buttonClass({ variant: "ghost" })}>
                Show more results
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
