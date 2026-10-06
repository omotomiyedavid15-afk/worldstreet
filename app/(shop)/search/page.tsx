import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rules } from "@/config/marketplace-rules";
import { Morph } from "@/components/motion/Morph";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ListingCard } from "@/features/listing-card/ListingCard";
import { setLocation } from "@/features/location/actions";
import { LocationBar } from "@/features/location/LocationBar";
import { getHidden } from "@/features/hidden/server";
import { getAnchor } from "@/features/location/server";
import { FilterPanel } from "@/features/search/FilterPanel";
import { FilterSheet } from "@/features/search/FilterSheet";
import { SaveSearchButton } from "@/features/saved/SaveSearchButton";
import { MarkProhibited } from "@/features/search/MarkProhibited";
import { VIEW_COOKIE, parseView } from "@/features/search/view";
import { ViewToggle } from "@/features/search/ViewToggle";
import { ActiveFilterChips, EndOfResults, ProhibitedResults, ResultsHeader, ZeroResults } from "@/features/search/Results";
import { SearchTransitions, ShowMoreLink } from "@/features/search/SearchTransitions";
import { SortMenu } from "@/features/search/SortMenu";
import { listingPath, repos } from "@/lib/data";
import { formatCount } from "@/lib/format";
import { filterChips } from "@/lib/search/filter-labels";
import { parseFilters } from "@/lib/search/filters";
import { first, hrefWith, type SearchParams } from "@/lib/search/params";
import { parseQuery, type ParsedQuery } from "@/lib/search/query";
import { parseRadius } from "@/lib/search/radius";
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

  const [{ anchor, inferred }, hidden, categories, listings, jar] = await Promise.all([
    getAnchor(),
    getHidden(),
    repos.categories.list(),
    repos.listings.list(),
    cookies(),
  ]);
  const view = parseView(jar.get(VIEW_COOKIE)?.value);
  const radius = parseRadius(params.radius);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);
  const filters = parseFilters(params, categories.map((c) => c.id));
  // An id that matches no listing is searched as text, so it simply finds nothing.
  const query: ParsedQuery = parsed.kind === "listing-id" ? { kind: "text", raw: parsed.raw, tokens: [parsed.id] } : parsed;
  const returnTo = hrefWith(PATH, params, "page", null);
  const bar = <LocationBar anchor={anchor} inferred={inferred} radius={radius} returnTo={returnTo} action={setLocation} />;

  if (query.kind === "prohibited") {
    return (
      <div className="ws-search-page">
        <MarkProhibited term={parsed.raw} />
        <ResultsHeader query={parsed.raw} anchor={anchor} near={false} total={0} shown={0} sortMenu={null} />
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
    hidden,
    city: anchor.city,
  });

  const panel = (variant: "rail" | "sheet", id: string) => (
    <FilterPanel
      id={id}
      variant={variant}
      filters={filters}
      facets={result.facets}
      radius={radius}
      radiusCounts={result.radiusCounts}
      total={result.total}
      categories={categories}
      params={params}
    />
  );
  const applied = filterChips(filters, categories).length + (radius === rules.location.defaultRadiusKm ? 0 : 1);
  const sortMenu = <SortMenu current={sort} pathname={PATH} params={params} />;
  const thisPage = hrefWith(PATH, params, "page", null);
  const headerSort = (
    <div className="ws-results-head__sort">
      {sortMenu}
      <ViewToggle view={view} returnTo={thisPage} />
    </div>
  );

  return (
    <SearchTransitions pathname={PATH}>
      {bar}
      <div className="ws-search-layout">
        {/* FilterRail (spec §6): from 1024px, beside the results. */}
        <aside className="ws-search-rail" aria-label="Filter results">
          {panel("rail", "filters-rail")}
        </aside>
        <div className="ws-search-main">
      <ResultsHeader
        query={parsed.raw}
        anchor={anchor}
        total={result.total}
        shown={result.shown.length}
        sortMenu={headerSort}
      />
      {result.total > 0 && (
        <SaveSearchButton href={thisPage} label={`${parsed.raw ? `“${parsed.raw}”` : "Everything"}${filterChips(filters, categories).map((c) => ` · ${c.label}`).join("")} near ${anchor.label}`} />
      )}
      {/* Below 1024px: the sticky "Filters · Sort" bar (flows B2 step 4). */}
      <div className="ws-filterbar">
        <FilterSheet count={applied}>{panel("sheet", "filters-sheet")}</FilterSheet>
        {result.total > 0 && sortMenu}
        {result.total > 0 && <ViewToggle view={view} returnTo={thisPage} className="ws-filterbar__view" />}
      </div>
      <ActiveFilterChips filters={filters} categories={categories} pathname={PATH} params={params} />

      {result.total === 0 ? (
        <ZeroResults
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
          {/* Cards rise in on scroll (GSAP); a sort or filter change crossfades (View Transitions). */}
          <Morph>
            <RevealOnScroll count={result.shown.length}>
              <ul className={`${view === "list" ? "ws-card-list" : "ws-card-grid"} ws-results`} aria-label="Listings">
                {result.shown.map((l, i) => (
                  <li key={l.id}>
                    <ListingCard
                      listing={l}
                      variant={view}
                      anchor={anchor}
                      headingLevel="h2"
                      load={i < rules.media.highPriorityCards ? "high" : i < rules.media.eagerCards ? "eager" : "lazy"}
                    />
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </Morph>
          {result.shown.length < result.total ? (
            <div className="ws-results-more">
              <p className="ws-results-more__progress">
                You&apos;ve viewed {formatCount(result.shown.length)} of {formatCount(result.total)} results
              </p>
              <ShowMoreLink href={hrefWith(PATH, params, "page", String(page + 1))} />
            </div>
          ) : (
            <EndOfResults total={result.total} radius={radius} radiusCounts={result.radiusCounts} pathname={PATH} params={params} />
          )}
        </>
      )}
        </div>
      </div>
    </SearchTransitions>
  );
}
