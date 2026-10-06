import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ToastViewport } from "@/components/ui";
import { Suspense } from "react";
import { CATEGORY_ICONS } from "@/features/home/category-icons";
import { AppHeader } from "@/features/shell/AppHeader";
import { navCategories } from "@/features/shell/categories";
import { MegaMenu } from "@/features/shell/MegaMenu";
import { DrawerLink } from "@/features/shell/NavDrawer";
import { BottomNav } from "@/features/shell/BottomNav";
import { SiteFooter } from "@/features/shell/SiteFooter";
import { SkipLinks } from "@/features/shell/SkipLinks";
import { repos } from "@/lib/data";
import { ESCROW } from "@/lib/copy/escrow";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute URLs for link previews (WhatsApp, X). Set SITE_URL in each environment.
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "WorldStreet Marketplace", template: "%s · WorldStreet Marketplace" },
  description: ESCROW.tagline,
  openGraph: { siteName: "WorldStreet Marketplace", locale: "en_NG", type: "website" },
  twitter: { card: "summary_large_image" },
};

/* The browser toolbar matches the dark page (built dark-first, 6 Oct). */
export const viewport: Viewport = { themeColor: "#0c0a09", colorScheme: "dark" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [trending, categories, listings] = await Promise.all([repos.search.trending(), repos.categories.list(), repos.listings.list()]);
  const nav = navCategories(categories, listings);
  return (
    // data-theme must sit on an ancestor of data-brand: the DS light-theme selector is
    // "[data-theme=light] [data-brand=worldstreet]".
    <html lang="en" data-theme="dark" className={fontVariables}>
      <body className="cx-root" data-brand="worldstreet">
        <MotionProvider>
          <SkipLinks />
          <AppHeader
            trending={trending}
            categories={
              <Suspense>
                <MegaMenu categories={nav} />
              </Suspense>
            }
            categoryLinks={
              <nav aria-label="Shop by category" className="ws-drawer__cats">
                <p className="ws-drawer__label">Shop by category</p>
                {nav.map((c) => {
                  const Icon = CATEGORY_ICONS[c.id];
                  return (
                    <DrawerLink key={c.id} href={`/search?cat=${c.id}`} icon={<Icon />}>
                      {c.name}
                    </DrawerLink>
                  );
                })}
              </nav>
            }
          />
          {children}
          <SiteFooter />
          <BottomNav />
          <ToastViewport />
        </MotionProvider>
      </body>
    </html>
  );
}
