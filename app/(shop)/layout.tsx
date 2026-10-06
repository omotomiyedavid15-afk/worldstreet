import type { ReactNode } from "react";
import { CategoryRail } from "@/features/shell/CategoryRail";
import { repos } from "@/lib/data";

/* Buyer-facing pages: the category rail under the header (it scrolls away with the
   page, audit F17), then the page. Header, footer and bottom nav are in the root
   layout so the 404 has them too. */
export default async function ShopLayout({ children }: { children: ReactNode }) {
  const categories = (await repos.categories.list()).map(({ id, name }) => ({ id, name }));
  return (
    <>
      <CategoryRail categories={categories} />
      <main id="main" className="cx-container ws-page" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
