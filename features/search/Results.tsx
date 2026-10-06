import Link from "next/link";
import type { ReactNode } from "react";
import { MagnifyingGlassIcon, WarningIcon, XmarkCircleIcon } from "@/components/icons";
import { EmptyState, buttonClass } from "@/components/ui";
import type { Anchor } from "@/lib/areas";
import type { Category } from "@/lib/data/types";
import { formatCount, plural } from "@/lib/format";
import { formatCurrency } from "@/lib/money";
import type { Filters } from "@/lib/search/filters";
import { hrefWith, type SearchParams } from "@/lib/search/params";
import { RADII, radiusLabel, radiusParam, type Radius } from "@/lib/search/radius";

/* Results page parts (spec §6, flows B2): ResultsHeader, ActiveFilterChips and
   ZeroResults. Every suggestion is a plain link that changes the URL (R-011). */

type HeaderProps = { query: string; total: number; shown: number; sortMenu: ReactNode };

/** The page's one h1, the count in eBay's words ("Showing 24 of 1,284"), and sort. */
export function ResultsHeader({ query, total, shown, sortMenu }: HeaderProps) {
  return (
    <div className="ws-results-head">
      <div>
        <h1 className="ws-results-head__title">{query ? <>Results for “{query}”</> : "All listings"}</h1>
        <p className="ws-results-head__count" aria-live="polite">
          {total === 0 ? "No results" : shown < total ? `Showing ${formatCount(shown)} of ${formatCount(total)}` : plural(total, "result")}
        </p>
      </div>
      {total > 0 && sortMenu}
    </div>
  );
}

const priceLabel = (f: Filters) =>
  f.min !== undefined && f.max !== undefined
    ? `${formatCurrency(f.min)} – ${formatCurrency(f.max)}`
    : f.min !== undefined
      ? `From ${formatCurrency(f.min)}`
      : `Up to ${formatCurrency(f.max!)}`;

type ChipsProps = { filters: Filters; categories: readonly Category[]; pathname: string; params: SearchParams };

/** Active filters, each removable, plus Clear all (spec §6 ActiveFilterChips). */
export function ActiveFilterChips({ filters, categories, pathname, params }: ChipsProps) {
  const chips: { label: string; href: string }[] = [];
  if (filters.cat) chips.push({ label: categories.find((c) => c.id === filters.cat)?.name ?? filters.cat, href: hrefWith(pathname, params, "cat", null) });
  if (filters.min !== undefined || filters.max !== undefined) {
    chips.push({ label: priceLabel(filters), href: hrefWith(pathname, { ...params, min: undefined }, "max", null) });
  }
  if (chips.length === 0) return null;
  const clearAll = hrefWith(pathname, { ...params, cat: undefined, min: undefined }, "max", null);
  return (
    <ul className="ws-filter-chips" aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.label}>
          <Link href={c.href} className="ws-filter-chip">
            {c.label}
            <XmarkCircleIcon />
            <span className="cx-sr-only">Remove filter</span>
          </Link>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <Link href={clearAll} className="ws-filter-chips__clear">
            Clear all
          </Link>
        </li>
      )}
    </ul>
  );
}

type ZeroProps = {
  query: string;
  anchor: Anchor;
  radius: Radius;
  radiusCounts: ReadonlyMap<Radius, number>;
  filterCounts: ReadonlyMap<"cat" | "price", number>;
  filters: Filters;
  categories: readonly Category[];
  pathname: string;
  params: SearchParams;
};

/**
 * ZeroResults (flows B2): widen the radius (with how many that finds), drop a filter
 * (with counts), or browse popular categories. Only suggestions that find something
 * are offered.
 */
export function ZeroResults({ query, anchor, radius, radiusCounts, filterCounts, filters, categories, pathname, params }: ZeroProps) {
  const wider = RADII.filter((r) => radius !== null && (r === null || r > radius)).find((r) => (radiusCounts.get(r) ?? 0) > 0);
  const drops = [...filterCounts].filter(([, n]) => n > 0);
  const nameOf = (k: "cat" | "price") => (k === "cat" ? categories.find((c) => c.id === filters.cat)?.name ?? "category" : "price");
  const dropHref = (k: "cat" | "price") => (k === "cat" ? hrefWith(pathname, params, "cat", null) : hrefWith(pathname, { ...params, min: undefined }, "max", null));

  return (
    <EmptyState
      icon={<MagnifyingGlassIcon />}
      title={query ? `No results for “${query}” near ${anchor.label}` : `Nothing listed near ${anchor.label} yet`}
      headingLevel="h2"
    >
      <span className="ws-zero">
        {wider !== undefined && (
          <Link href={hrefWith(pathname, params, "radius", radiusParam(wider))} className={buttonClass({ variant: "ghost", size: "sm" })}>
            {plural(radiusCounts.get(wider)!, "result")} {wider === null ? "nationwide" : `within ${radiusLabel(wider)}`}
          </Link>
        )}
        {drops.map(([k, n]) => (
          <Link key={k} href={dropHref(k)} className={buttonClass({ variant: "quiet", size: "sm" })}>
            Remove {nameOf(k)} ({plural(n, "result")})
          </Link>
        ))}
        {wider === undefined && drops.length === 0 && (
          <span className="ws-zero__cats">
            Try a different word, or browse{" "}
            {categories.slice(0, 4).map((c, i) => (
              <span key={c.id}>
                {i > 0 && ", "}
                <Link href={`/search?cat=${c.id}`}>{c.name}</Link>
              </span>
            ))}
            .
          </span>
        )}
      </span>
    </EmptyState>
  );
}

/** EC-004: a neutral "No results" with the policy link, and no suggestions. */
export function ProhibitedResults() {
  return (
    <EmptyState icon={<WarningIcon />} title="No results" headingLevel="h2">
      Some items can&apos;t be sold on WorldStreet.{" "}
      <Link href="/help/prohibited-items">See what isn&apos;t allowed</Link>.
    </EmptyState>
  );
}
