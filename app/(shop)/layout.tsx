import type { ReactNode } from "react";

/* Buyer-facing pages. The header, footer and bottom nav (Phase 1) will live here. */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="cx-container ws-page">
      {children}
    </main>
  );
}
