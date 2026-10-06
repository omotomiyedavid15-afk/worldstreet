import type { CategoryId, Listing } from "@/lib/data/types";
import { toMinor, type Kobo } from "@/lib/money";
import { first, type SearchParams } from "./params";

/* URL filters for Sprint 0 (R-011): ?cat= and ?min=&max= in whole naira. Phase 2 adds
   condition, format, delivery and the rest. Anything invalid is ignored, not an error. */

export type Filters = { cat?: CategoryId; min?: Kobo; max?: Kobo };
export type FilterKey = keyof Filters;

const naira = (v: string | undefined) => {
  if (!v || !/^\d{1,10}$/.test(v)) return undefined;
  return toMinor(Number(v));
};

export function parseFilters(params: SearchParams, categories: readonly CategoryId[]): Filters {
  const cat = first(params.cat);
  let min = naira(first(params.min));
  let max = naira(first(params.max));
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return {
    ...(cat && (categories as readonly string[]).includes(cat) && { cat: cat as CategoryId }),
    ...(min !== undefined && { min }),
    ...(max !== undefined && { max }),
  };
}

export function applyFilters<T extends Pick<Listing, "category_id" | "price_minor">>(listings: readonly T[], f: Filters): T[] {
  return listings.filter(
    (l) => (!f.cat || l.category_id === f.cat) && (f.min === undefined || l.price_minor >= f.min) && (f.max === undefined || l.price_minor <= f.max),
  );
}

/** Active filters as removable chips: price is one chip covering min and max. */
export function activeFilterKeys(f: Filters): ("cat" | "price")[] {
  const keys: ("cat" | "price")[] = [];
  if (f.cat) keys.push("cat");
  if (f.min !== undefined || f.max !== undefined) keys.push("price");
  return keys;
}

export function withoutFilter(f: Filters, key: "cat" | "price"): Filters {
  if (key === "cat") return { min: f.min, max: f.max };
  return { cat: f.cat };
}
