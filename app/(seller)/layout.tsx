import type { ReactNode } from "react";

/* Seller pages (Phase 7). The SellerShell with the DS sidebar replaces this frame. */
export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="cx-container ws-page">
      {children}
    </main>
  );
}
