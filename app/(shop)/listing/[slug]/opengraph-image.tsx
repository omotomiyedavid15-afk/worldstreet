import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { parseListingParam, repos } from "@/lib/data";
import { formatCurrency } from "@/lib/money";

/* The WhatsApp/X preview image for a listing (blueprint F16): title, the price in gold,
   and the area, on the brand's dark stone. Photos join once listings have raster
   photos (the mocks are SVG, which previews don't show). */

export const alt = "Listing on WorldStreet Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The default preview font has no ₦; this one-glyph bold Noto instance fills the gap.
const naira = readFile(join(process.cwd(), "app/fonts/noto-sans-naira-700.ttf"));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const parsed = parseListingParam((await params).slug);
  const listing = parsed ? await repos.listings.get(parsed.id) : null;
  const price = listing ? `${formatCurrency(listing.price_minor)}${listing.price_period ? ` per ${listing.price_period}` : ""}` : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0c0a09", color: "#f5f5f4" }}>
        <div style={{ display: "flex", fontSize: 28, color: "#eab308", letterSpacing: 1 }}>WorldStreet Marketplace</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 64, lineHeight: 1.15, maxHeight: 220, overflow: "hidden" }}>{listing?.title ?? "Listing not found"}</div>
          {listing && <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#eab308" }}>{price}</div>}
        </div>
        {listing && (
          <div style={{ display: "flex", fontSize: 30, color: "#d6d3d1" }}>
            {listing.location.area}, {listing.location.city}
          </div>
        )}
      </div>
    ),
    { ...size, fonts: [{ name: "Naira", data: await naira, weight: 700, style: "normal" }] },
  );
}
