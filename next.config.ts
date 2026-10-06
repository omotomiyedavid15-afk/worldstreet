import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF is ~20% smaller than WebP for photos, and data is dear (UI research, 6 Oct).
    formats: ["image/avif", "image/webp"],
    // 60 for rail/compact thumbnails (rules.media.thumbQuality), 75 for everything else.
    qualities: [60, 75],
  },
};

export default nextConfig;
