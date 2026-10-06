import type { NextRequest } from "next/server";
import { repos } from "@/lib/data";
import type { ListingStatus } from "@/lib/data/types";

/* GET /api/listings?ids=a,b for lists kept on the device (Saved, Recently viewed).
   Sold and ended listings come back too, so Saved can mark them (R-026); ids that no
   longer exist simply don't (EC-006: shown as removed). */
const SHOWN: ListingStatus[] = ["live", "reserved", "sold", "ended", "paused"];
const MAX = 500;

export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .filter((id) => /^[A-Za-z0-9]{1,20}$/.test(id))
    .slice(0, MAX);
  if (ids.length === 0) return Response.json({ items: [] });
  const items = await repos.listings.list({ ids, status: SHOWN });
  return Response.json({ items }, { headers: { "Cache-Control": "private, max-age=30" } });
}
