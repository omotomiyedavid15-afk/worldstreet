import type { NextRequest } from "next/server";
import { getHidden } from "@/features/hidden/server";
import { getAnchor } from "@/features/location/server";
import { repos } from "@/lib/data";
import { parseFilters } from "@/lib/search/filters";
import { parseQuery } from "@/lib/search/query";
import { parseRadius } from "@/lib/search/radius";
import { runSearch } from "@/lib/search/run";

/* GET /api/search-count?… with the results page's params: how many results they'd
   give, for the filter sheet's "Show N results" (spec §6). Same search as the page. */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const params: Record<string, string | string[]> = {};
  for (const key of new Set(sp.keys())) {
    const all = sp.getAll(key);
    params[key] = all.length > 1 ? all : all[0];
  }
  const parsed = parseQuery(sp.get("q") ?? undefined);
  if (parsed.kind === "prohibited") return Response.json({ total: 0 });
  const [{ anchor }, hidden, categories, listings] = await Promise.all([getAnchor(), getHidden(), repos.categories.list(), repos.listings.list()]);
  const query = parsed.kind === "listing-id" ? { kind: "text" as const, raw: parsed.raw, tokens: [parsed.id] } : parsed;
  const result = runSearch({
    listings,
    query,
    filters: parseFilters(params, categories.map((c) => c.id)),
    anchor,
    radius: parseRadius(params.radius),
    sort: "best",
    page: 1,
    hidden,
    city: anchor.city,
  });
  return Response.json({ total: result.total });
}
