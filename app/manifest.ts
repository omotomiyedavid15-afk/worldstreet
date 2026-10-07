import type { MetadataRoute } from "next";
import { ESCROW } from "@/lib/copy/escrow";

/* Web app manifest (audit F16): installable, dark like the site (built dark-first). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WorldStore Marketplace",
    short_name: "WorldStore",
    description: ESCROW.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    lang: "en-NG",
    categories: ["shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
