import type { NextRequest } from "next/server";
import { rules } from "@/config/marketplace-rules";
import { repos } from "@/lib/data";
import { suggest } from "@/lib/search/suggest";

/* GET /api/suggest?q=…&max=… for the search box (B2 step 2). Cached briefly by the
   browser: the same prefix comes up again as people type and delete. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const typed = (params.get("q") ?? "").slice(0, 200);
  const max = Math.min(Number(params.get("max")) || rules.search.maxSuggestions, rules.search.maxSuggestions);
  const [listings, categories, sellers, trending] = await Promise.all([
    repos.listings.list(),
    repos.categories.list(),
    repos.sellers.list(),
    repos.search.trending(),
  ]);
  return Response.json({ items: suggest({ typed, listings, categories, sellers, trending, max }) }, { headers: { "Cache-Control": "private, max-age=60" } });
}
